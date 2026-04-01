import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { VehicleEntity } from '@modules/vehicles/entities/vehicle.entity';
import { GpsDataPipelineService } from './gps-data-pipeline.service';

/**
 * TrackerDiscoveryService
 *
 * Scans all GPS providers every 12 hours to detect new trackers/devices
 * that are not yet in the database. When a new device is found, it is
 * automatically imported with proper metadata mapping so the pipeline
 * can start persisting GPS data immediately.
 *
 * Provider discovery methods:
 *   - Flespi:    GET /gw/devices/all           → device.id, device.name, device.configuration.ident (IMEI)
 *   - Echoes:    GET /api/accounts/{id}/assets  → paginated, asset.id, asset.name, asset.registration
 *   - KeepTrace: GET api/Vehicle/GetVehicles    → VehicleId, Name, Registration
 *   - Ubiwan:    GET /v53/location?timestamp=0  → uid, registration, summary, dev_hw_id
 */
@Injectable()
export class TrackerDiscoveryService {
  private readonly logger = new Logger(TrackerDiscoveryService.name);
  private readonly orgId: string;

  constructor(
    @InjectRepository(VehicleEntity)
    private vehiclesRepository: Repository<VehicleEntity>,
    private configService: ConfigService,
    private pipeline: GpsDataPipelineService,
  ) {
    // Default org for auto-imported vehicles
    this.orgId = this.configService.get<string>(
      'DEFAULT_ORG_ID',
      'a040ba4f-e427-4a9c-abc4-dce3dc05d24f',
    );
  }

  /**
   * Run discovery every 12 hours (at 00:30 and 12:30)
   */
  @Cron('30 0,12 * * *')
  async discoverNewTrackers(): Promise<void> {
    this.logger.log('=== Tracker Discovery: scanning all providers for new devices ===');

    const results = await Promise.allSettled([
      this.discoverFlespi(),
      this.discoverEchoes(),
      this.discoverKeepTrace(),
      this.discoverUbiwan(),
    ]);

    let totalNew = 0;
    const providerNames = ['FLESPI', 'ECHOES', 'KEEPTRACE', 'UBIWAN'];

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled') {
        totalNew += r.value;
        if (r.value > 0) {
          this.logger.log(`${providerNames[i]}: ${r.value} new tracker(s) imported`);
        }
      } else {
        this.logger.error(`${providerNames[i]} discovery failed: ${r.reason}`);
      }
    }

    if (totalNew > 0) {
      this.logger.log(`Discovery complete: ${totalNew} new tracker(s) imported. Refreshing pipeline cache...`);
      await this.pipeline.refreshVehicleCache();
    } else {
      this.logger.log('Discovery complete: no new trackers found.');
    }
  }

  // ─── FLESPI ───────────────────────────────────────────────────────────

  private async discoverFlespi(): Promise<number> {
    const token = this.configService.get<string>('FLESPI_TOKEN', '');
    if (!token) return 0;

    const response = await fetch('https://flespi.io/gw/devices/all', {
      headers: {
        Authorization: `FlespiToken ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Flespi API ${response.status}`);
    }

    const data = (await response.json()) as any;
    const devices: any[] = data.result || [];

    // Get existing flespiChannelIds
    const existing = await this.getExistingMetadataKeys('flespiChannelId');

    let imported = 0;
    for (const device of devices) {
      const deviceId = String(device.id);
      if (existing.has(deviceId)) continue;

      const ident = device.configuration?.ident || '';
      const name = device.name || `Flespi Device ${deviceId}`;

      await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: this.orgId,
          name,
          plate: ident || `FLESPI-${deviceId}`,
          deviceImei: ident,
          status: 'active' as any,
          metadata: { flespiChannelId: deviceId },
        }),
      );
      imported++;
      this.logger.log(`  [FLESPI] New device: ${name} (id=${deviceId}, imei=${ident})`);
    }

    return imported;
  }

  // ─── ECHOES ───────────────────────────────────────────────────────────

  private async discoverEchoes(): Promise<number> {
    const apiKey = this.configService.get<string>('ECHOES_API_KEY', '');
    const accountId = this.configService.get<string>('ECHOES_ACCOUNT_ID', '');
    if (!apiKey || !accountId) return 0;

    // Step 1: get a privacy key
    const privacyKey = await this.getEchoesPrivacyKey(apiKey, accountId);

    // Step 2: fetch all assets with pagination
    const allAssets: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await fetch(
        `https://api.neutral-server.com/api/accounts/${accountId}/assets?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Privacykey ${privacyKey}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) throw new Error(`Echoes API ${response.status}`);
      const assets = (await response.json()) as any[];
      if (!Array.isArray(assets) || assets.length === 0) break;

      allAssets.push(...assets);
      if (assets.length < limit) break;
      offset += limit;
    }

    // Get existing echoesUids
    const existing = await this.getExistingMetadataKeys('echoesUid');

    let imported = 0;
    for (const asset of allAssets) {
      const assetId = String(asset.id);
      if (existing.has(assetId)) continue;

      const name = asset.name || asset.registration || `Echoes Asset ${assetId}`;
      const plate = asset.registration || `ECHOES-${assetId}`;

      await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: this.orgId,
          name,
          plate,
          status: 'active' as any,
          metadata: { echoesUid: assetId },
        }),
      );
      imported++;
      this.logger.log(`  [ECHOES] New asset: ${name} (id=${assetId})`);
    }

    return imported;
  }

  private async getEchoesPrivacyKey(apiKey: string, accountId: string): Promise<string> {
    const listResponse = await fetch(
      `https://api.neutral-server.com/api/accounts/${accountId}/privacy_key`,
      {
        headers: {
          Authorization: `Apikey ${apiKey}`,
          Accept: 'application/json',
        },
      },
    );

    if (!listResponse.ok) throw new Error(`Echoes privacy key list: ${listResponse.status}`);

    const keys = (await listResponse.json()) as any[];
    const now = Date.now();
    const valid = keys
      .filter((k) => k.expiredAt > now && k.features?.includes('LOCATION'))
      .sort((a: any, b: any) => b.expiredAt - a.expiredAt);

    if (valid.length > 0) return valid[0].token;

    // Create new key
    const createResponse = await fetch(
      `https://api.neutral-server.com/api/accounts/${accountId}/privacy_key`,
      {
        method: 'POST',
        headers: {
          Authorization: `Apikey ${apiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: ['LOCATION', 'TRIPS', 'SPEED', 'ODOMETER', 'GEOFENCING', 'ENERGY'],
        }),
      },
    );

    if (!createResponse.ok) throw new Error(`Echoes create key: ${createResponse.status}`);
    const newKey = (await createResponse.json()) as any;
    return newKey.token;
  }

  // ─── KEEPTRACE ────────────────────────────────────────────────────────

  private async discoverKeepTrace(): Promise<number> {
    const apiKey = this.configService.get<string>('KEEPTRACE_API_KEY', '');
    if (!apiKey) return 0;

    const apiUrl = this.configService.get<string>(
      'KEEPTRACE_API_URL',
      'https://customerapi.live.keeptrace.fr',
    );

    const response = await fetch(`${apiUrl}/api/Vehicle/GetVehicles`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization-Key': apiKey,
      },
    });

    if (!response.ok) throw new Error(`KeepTrace API ${response.status}`);

    const vehicles = (await response.json()) as any[];
    if (!Array.isArray(vehicles)) return 0;

    // Get existing keeptraceIds
    const existing = await this.getExistingMetadataKeys('keeptraceId');

    let imported = 0;
    for (const v of vehicles) {
      const vid = String(v.VehicleId || v.Id || v.id);
      if (existing.has(vid)) continue;

      const name = v.Name || v.name || `KeepTrace ${vid}`;
      const plate = v.Registration || v.registration || v.LicensePlate || `KT-${vid}`;
      const imei = v.Imei || v.imei || '';

      await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: this.orgId,
          name,
          plate,
          deviceImei: imei || undefined,
          status: 'active' as any,
          metadata: { keeptraceId: vid },
        }),
      );
      imported++;
      this.logger.log(`  [KEEPTRACE] New vehicle: ${name} (id=${vid}, plate=${plate})`);
    }

    return imported;
  }

  // ─── UBIWAN ───────────────────────────────────────────────────────────

  private async discoverUbiwan(): Promise<number> {
    const username = this.configService.get<string>('UBIWAN_USERNAME', '');
    const md5Password = this.configService.get<string>('UBIWAN_PASSWORD', '');
    const license = this.configService.get<string>('UBIWAN_LICENSE', '');
    const serverKey = this.configService.get<string>('UBIWAN_SERVER_KEY', '');
    const apiUrl = this.configService.get<string>(
      'UBIWAN_API_URL',
      'https://api-fleet.moncoyote.com',
    );

    if (!username || !md5Password || !license) return 0;

    // Authenticate
    const authResponse = await fetch(
      `${apiUrl}/v53/auth?u=${encodeURIComponent(username)}&l=${encodeURIComponent(license)}&k=${encodeURIComponent(serverKey)}&p=${md5Password}`,
      { headers: { Accept: 'application/json' } },
    );

    if (!authResponse.ok) throw new Error(`Ubiwan auth ${authResponse.status}`);
    const authData = (await authResponse.json()) as any;
    if (authData.result !== 201 || !authData.token) {
      throw new Error(`Ubiwan auth failed: result=${authData.result}`);
    }

    const token = authData.token;

    // Fetch all devices via /location
    const locResponse = await fetch(
      `${apiUrl}/v53/location?token=${encodeURIComponent(token)}&timestamp=0`,
      { headers: { Accept: 'application/json' } },
    );

    if (!locResponse.ok) throw new Error(`Ubiwan location ${locResponse.status}`);
    const locData = (await locResponse.json()) as any;
    const devices: any[] = locData.location?.data || [];

    // Get existing ubiwanIds
    const existing = await this.getExistingMetadataKeys('ubiwanId');

    let imported = 0;
    for (const dev of devices) {
      const uid = String(dev.uid);
      if (existing.has(uid)) continue;

      const registration = dev.registration || '';
      const summary = dev.summary || '';
      const imei = dev.dev_hw_id || '';
      const brand = summary.split(' ')[0] || '';
      const model = summary.split(' ').slice(1).join(' ') || '';
      const name = summary || `Ubiwan Device ${uid}`;
      const plate = registration || `UBIWAN-${uid}`;

      await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: this.orgId,
          name,
          plate,
          brand: brand || undefined,
          model: model || undefined,
          deviceImei: imei || undefined,
          status: 'active' as any,
          metadata: {
            ubiwanId: uid,
            ubiwanParent: String(dev.uid_parent || ''),
            hardware: dev.hardware || '',
          },
        }),
      );
      imported++;
      this.logger.log(`  [UBIWAN] New device: ${name} (uid=${uid}, plate=${plate})`);
    }

    return imported;
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────

  /**
   * Get all existing metadata values for a given key to avoid duplicate imports.
   * Returns a Set of string values.
   */
  private async getExistingMetadataKeys(key: string): Promise<Set<string>> {
    const results = await this.vehiclesRepository
      .createQueryBuilder('v')
      .select(`v.metadata->>'${key}'`, 'extId')
      .where(`v.metadata->>'${key}' IS NOT NULL`)
      .getRawMany();

    return new Set(results.map((r) => r.extId));
  }
}
