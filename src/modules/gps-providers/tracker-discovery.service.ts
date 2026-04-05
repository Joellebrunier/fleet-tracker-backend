import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { VehicleEntity } from '@modules/vehicles/entities/vehicle.entity';
import { GpsHistoryEntity } from '@modules/gps-history/entities/gps-history.entity';
import { ProviderCredentialsEntity } from '@modules/organizations/entities/provider-credentials.entity';
import { Provider } from '@common/enums/provider.enum';
import { GpsDataPipelineService } from './gps-data-pipeline.service';

/**
 * TrackerDiscoveryService — Multi-Org Edition
 *
 * Scans all GPS providers every 12 hours to detect new trackers/devices.
 * Now works per-organization: each org can have its own provider credentials
 * stored in the provider_credentials table. Falls back to env vars for
 * backward compatibility (legacy single-org mode).
 */
@Injectable()
export class TrackerDiscoveryService {
  private readonly logger = new Logger(TrackerDiscoveryService.name);
  private readonly HISTORY_BACKFILL_DAYS = 30;

  constructor(
    @InjectRepository(VehicleEntity)
    private vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(GpsHistoryEntity)
    private gpsHistoryRepository: Repository<GpsHistoryEntity>,
    @InjectRepository(ProviderCredentialsEntity)
    private providerCredentialsRepository: Repository<ProviderCredentialsEntity>,
    private configService: ConfigService,
    private pipeline: GpsDataPipelineService,
  ) {}

  /** Default org (fallback for env var credentials) */
  private get defaultOrgId(): string {
    return this.configService.get<string>(
      'DEFAULT_ORG_ID',
      'a040ba4f-e427-4a9c-abc4-dce3dc05d24f',
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DISCOVERY CRON — runs for ALL orgs that have credentials
  // ═══════════════════════════════════════════════════════════════════════

  @Cron('30 0,12 * * *')
  async discoverNewTrackers(): Promise<void> {
    this.logger.log('=== Tracker Discovery: scanning all orgs for new devices ===');

    // 1. Load all active credentials from DB
    const allCreds = await this.providerCredentialsRepository.find({
      where: { isActive: true },
    });

    // Group by orgId
    const credsByOrg = new Map<string, ProviderCredentialsEntity[]>();
    for (const cred of allCreds) {
      const list = credsByOrg.get(cred.organizationId) || [];
      list.push(cred);
      credsByOrg.set(cred.organizationId, list);
    }

    // 2. Also add env var fallback for the default org if no DB creds exist
    if (!credsByOrg.has(this.defaultOrgId)) {
      const envCreds = this.buildEnvVarCredentials();
      if (envCreds.length > 0) {
        credsByOrg.set(this.defaultOrgId, envCreds);
      }
    }

    let totalNew = 0;

    for (const [orgId, orgCreds] of credsByOrg) {
      this.logger.log(`--- Discovering for org ${orgId} (${orgCreds.length} provider(s)) ---`);
      const results = await Promise.allSettled(
        orgCreds.map((cred) => this.discoverForProvider(orgId, cred)),
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          totalNew += r.value;
        } else {
          this.logger.error(`Discovery failed: ${r.reason}`);
        }
      }
    }

    if (totalNew > 0) {
      this.logger.log(`Discovery complete: ${totalNew} new tracker(s). Refreshing cache...`);
      await this.pipeline.refreshVehicleCache();
    } else {
      this.logger.log('Discovery complete: no new trackers found.');
    }
  }

  /**
   * Route to the right discover method based on provider type.
   */
  private async discoverForProvider(
    orgId: string,
    cred: ProviderCredentialsEntity,
  ): Promise<number> {
    const c = cred.credentials;

    switch (cred.provider) {
      case Provider.FLESPI:
        return this.discoverFlespi(orgId, c.token);
      case Provider.ECHOES:
        return this.discoverEchoes(
          orgId,
          c.apiKey,
          c.accountId,
          c.apiUrl || 'https://api.neutral-server.com',
        );
      case Provider.KEEPTRACE:
        return this.discoverKeepTrace(
          orgId,
          c.apiKey,
          c.apiUrl || 'https://customerapi.live.keeptrace.fr',
        );
      case Provider.UBIWAN:
        return this.discoverUbiwan(
          orgId,
          c.username,
          c.password,
          c.license,
          c.serverKey || '',
          c.apiUrl || 'https://api-fleet.moncoyote.com',
        );
      default:
        return 0;
    }
  }

  /**
   * Build pseudo-ProviderCredentialsEntity objects from env vars.
   * Used as fallback when no DB credentials exist for the default org.
   */
  private buildEnvVarCredentials(): ProviderCredentialsEntity[] {
    const result: ProviderCredentialsEntity[] = [];

    const flespiToken = this.configService.get<string>('FLESPI_TOKEN', '');
    if (flespiToken) {
      result.push({
        provider: Provider.FLESPI,
        credentials: { token: flespiToken },
        organizationId: this.defaultOrgId,
        isActive: true,
      } as any);
    }

    const echoesApiKey = this.configService.get<string>('ECHOES_API_KEY', '');
    const echoesAccountId = this.configService.get<string>('ECHOES_ACCOUNT_ID', '');
    if (echoesApiKey && echoesAccountId) {
      result.push({
        provider: Provider.ECHOES,
        credentials: {
          apiKey: echoesApiKey,
          accountId: echoesAccountId,
          apiUrl: this.configService.get('ECHOES_API_URL', 'https://api.neutral-server.com'),
        },
        organizationId: this.defaultOrgId,
        isActive: true,
      } as any);
    }

    const ktApiKey = this.configService.get<string>('KEEPTRACE_API_KEY', '');
    if (ktApiKey) {
      result.push({
        provider: Provider.KEEPTRACE,
        credentials: {
          apiKey: ktApiKey,
          apiUrl: this.configService.get('KEEPTRACE_API_URL', 'https://customerapi.live.keeptrace.fr'),
        },
        organizationId: this.defaultOrgId,
        isActive: true,
      } as any);
    }

    const ubiwanUser = this.configService.get<string>('UBIWAN_USERNAME', '');
    const ubiwanPass = this.configService.get<string>('UBIWAN_PASSWORD', '');
    const ubiwanLicense = this.configService.get<string>('UBIWAN_LICENSE', '');
    if (ubiwanUser && ubiwanPass && ubiwanLicense) {
      result.push({
        provider: Provider.UBIWAN,
        credentials: {
          username: ubiwanUser,
          password: ubiwanPass,
          license: ubiwanLicense,
          serverKey: this.configService.get('UBIWAN_SERVER_KEY', ''),
          apiUrl: this.configService.get('UBIWAN_API_URL', 'https://api-fleet.moncoyote.com'),
        },
        organizationId: this.defaultOrgId,
        isActive: true,
      } as any);
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FLESPI
  // ═══════════════════════════════════════════════════════════════════════

  private async discoverFlespi(orgId: string, token: string): Promise<number> {
    if (!token) return 0;

    const response = await fetch('https://flespi.io/gw/devices/all', {
      headers: { Authorization: `FlespiToken ${token}`, Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Flespi API ${response.status}`);

    const data = (await response.json()) as any;
    const devices: any[] = data.result || [];
    const existing = await this.getExistingMetadataKeys('flespiChannelId');

    let imported = 0;
    for (const device of devices) {
      const deviceId = String(device.id);
      if (existing.has(deviceId)) continue;

      const ident = device.configuration?.ident || '';
      const name = device.name || `Flespi Device ${deviceId}`;

      const vehicle = await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: orgId,
          name,
          plate: ident || `FLESPI-${deviceId}`,
          deviceImei: ident,
          status: 'active' as any,
          metadata: { flespiChannelId: deviceId },
        }),
      );
      imported++;
      this.logger.log(`  [FLESPI][${orgId}] New device: ${name} (id=${deviceId})`);

      this.backfillFlespiHistory(vehicle.id, orgId, deviceId, token).catch((err) =>
        this.logger.error(`  [FLESPI] Backfill failed ${deviceId}: ${err.message}`),
      );
    }
    return imported;
  }

  private async backfillFlespiHistory(
    vehicleId: string,
    orgId: string,
    deviceId: string,
    token: string,
  ): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const from = now - this.HISTORY_BACKFILL_DAYS * 86400;

    const response = await fetch(
      `https://flespi.io/gw/devices/${deviceId}/messages?data={"from":${from},"to":${now}}`,
      { headers: { Authorization: `FlespiToken ${token}`, Accept: 'application/json' } },
    );
    if (!response.ok) return;

    const data = (await response.json()) as any;
    const messages: any[] = data.result || [];
    if (messages.length === 0) return;

    const records: Partial<GpsHistoryEntity>[] = [];
    for (const msg of messages) {
      const lat = msg['position.latitude'] || msg.latitude;
      const lng = msg['position.longitude'] || msg.longitude;
      if (!lat || !lng) continue;
      records.push({
        vehicleId,
        organizationId: orgId,
        lat,
        lng,
        speed: msg['position.speed'] || msg.speed || 0,
        heading: msg['position.direction'] || msg.heading || 0,
        altitude: msg['position.altitude'] || msg.altitude,
        provider: Provider.FLESPI,
        createdAt: new Date((msg.timestamp || msg['server.timestamp'] || now) * 1000),
        metadata: { source: 'backfill' },
      });
    }

    await this.batchInsertHistory(records);
    this.logger.log(`  [FLESPI] Backfilled ${records.length} positions for device ${deviceId}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ECHOES
  // ═══════════════════════════════════════════════════════════════════════

  private async discoverEchoes(
    orgId: string,
    apiKey: string,
    accountId: string,
    apiUrl: string,
  ): Promise<number> {
    if (!apiKey || !accountId) return 0;

    const privacyKey = await this.getEchoesPrivacyKey(apiKey, accountId, apiUrl);

    const allAssets: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await fetch(
        `${apiUrl}/api/accounts/${accountId}/assets?limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Privacykey ${privacyKey}`, Accept: 'application/json' } },
      );
      if (!response.ok) throw new Error(`Echoes API ${response.status}`);
      const assets = (await response.json()) as any[];
      if (!Array.isArray(assets) || assets.length === 0) break;
      allAssets.push(...assets);
      if (assets.length < limit) break;
      offset += limit;
    }

    const existing = await this.getExistingMetadataKeys('echoesUid');
    let imported = 0;

    for (const asset of allAssets) {
      const assetId = String(asset.id);
      if (existing.has(assetId)) continue;

      const name = asset.name || asset.registration || `Echoes Asset ${assetId}`;
      const plate = asset.registration || `ECHOES-${assetId}`;

      const vehicle = await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: orgId,
          name,
          plate,
          status: 'active' as any,
          metadata: { echoesUid: assetId },
        }),
      );
      imported++;
      this.logger.log(`  [ECHOES][${orgId}] New asset: ${name} (id=${assetId})`);

      this.backfillEchoesHistory(vehicle.id, orgId, assetId, privacyKey, accountId, apiUrl).catch(
        (err) => this.logger.error(`  [ECHOES] Backfill failed ${assetId}: ${err.message}`),
      );
    }
    return imported;
  }

  private async backfillEchoesHistory(
    vehicleId: string,
    orgId: string,
    assetId: string,
    privacyKey: string,
    accountId: string,
    apiUrl: string,
  ): Promise<void> {
    const now = Date.now();
    const from = now - this.HISTORY_BACKFILL_DAYS * 86400 * 1000;
    const period = JSON.stringify({ start: from, end: now });

    const response = await fetch(
      `${apiUrl}/api/accounts/${accountId}/assets/${assetId}/locations?period=${encodeURIComponent(period)}`,
      { headers: { Authorization: `Privacykey ${privacyKey}`, Accept: 'application/json' } },
    );
    if (!response.ok) return;

    const locations = (await response.json()) as any[];
    if (!Array.isArray(locations) || locations.length === 0) return;

    const records: Partial<GpsHistoryEntity>[] = [];
    for (const loc of locations) {
      const lat = loc.latitude || loc.lat;
      const lng = loc.longitude || loc.lng || loc.lon;
      if (!lat || !lng) continue;
      records.push({
        vehicleId,
        organizationId: orgId,
        lat,
        lng,
        speed: loc.speed || 0,
        heading: loc.heading || loc.direction || 0,
        altitude: loc.altitude,
        provider: Provider.ECHOES,
        createdAt: new Date(loc.timestamp || loc.date || loc.time || Date.now()),
        metadata: { source: 'backfill' },
      });
    }

    await this.batchInsertHistory(records);
    this.logger.log(`  [ECHOES] Backfilled ${records.length} positions for asset ${assetId}`);
  }

  private async getEchoesPrivacyKey(
    apiKey: string,
    accountId: string,
    apiUrl: string = 'https://api.neutral-server.com',
  ): Promise<string> {
    const listResponse = await fetch(`${apiUrl}/api/accounts/${accountId}/privacy_key`, {
      headers: { Authorization: `Apikey ${apiKey}`, Accept: 'application/json' },
    });
    if (!listResponse.ok) throw new Error(`Echoes privacy key list: ${listResponse.status}`);

    const keys = (await listResponse.json()) as any[];
    const now = Date.now();
    const valid = keys
      .filter((k) => k.expiredAt > now && k.features?.includes('LOCATION'))
      .sort((a: any, b: any) => b.expiredAt - a.expiredAt);

    if (valid.length > 0) return valid[0].token;

    const createResponse = await fetch(`${apiUrl}/api/accounts/${accountId}/privacy_key`, {
      method: 'POST',
      headers: {
        Authorization: `Apikey ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        features: ['LOCATION', 'TRIPS', 'SPEED', 'ODOMETER', 'GEOFENCING', 'ENERGY'],
      }),
    });
    if (!createResponse.ok) throw new Error(`Echoes create key: ${createResponse.status}`);
    const newKey = (await createResponse.json()) as any;
    return newKey.token;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // KEEPTRACE
  // ═══════════════════════════════════════════════════════════════════════

  private async discoverKeepTrace(
    orgId: string,
    apiKey: string,
    apiUrl: string,
  ): Promise<number> {
    if (!apiKey) return 0;

    const response = await fetch(`${apiUrl}/api/Vehicle/GetVehicles`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Authorization-Key': apiKey },
    });
    if (!response.ok) throw new Error(`KeepTrace API ${response.status}`);

    const vehicles = (await response.json()) as any[];
    if (!Array.isArray(vehicles)) return 0;

    const existing = await this.getExistingMetadataKeys('keeptraceId');
    let imported = 0;

    for (const v of vehicles) {
      const vid = String(v.VehicleId || v.Id || v.id);
      if (existing.has(vid)) continue;

      const name = v.Name || v.name || `KeepTrace ${vid}`;
      const plate = v.Registration || v.registration || v.LicensePlate || `KT-${vid}`;
      const imei = v.Imei || v.imei || '';

      const vehicle = await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: orgId,
          name,
          plate,
          deviceImei: imei || undefined,
          status: 'active' as any,
          metadata: { keeptraceId: vid },
        }),
      );
      imported++;
      this.logger.log(`  [KEEPTRACE][${orgId}] New vehicle: ${name} (id=${vid})`);

      this.backfillKeepTraceHistory(vehicle.id, orgId, vid, apiUrl, apiKey).catch((err) =>
        this.logger.error(`  [KEEPTRACE] Backfill failed ${vid}: ${err.message}`),
      );
    }
    return imported;
  }

  private async backfillKeepTraceHistory(
    vehicleId: string,
    orgId: string,
    keeptraceVehicleId: string,
    apiUrl: string,
    apiKey: string,
  ): Promise<void> {
    const now = new Date();
    const from = new Date(now.getTime() - this.HISTORY_BACKFILL_DAYS * 86400 * 1000);

    const response = await fetch(`${apiUrl}/api/History/GetJourneysLocations`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Authorization-Key': apiKey },
      body: JSON.stringify({ VehicleId: keeptraceVehicleId, StartDate: from.toISOString(), EndDate: now.toISOString() }),
    });
    if (!response.ok) return;

    const data = (await response.json()) as any;
    const journeys = Array.isArray(data) ? data : (data.Journeys || data.journeys || []);
    const records: Partial<GpsHistoryEntity>[] = [];

    for (const journey of journeys) {
      const locations = journey.Locations || journey.locations || journey.Points || journey.points || [];
      for (const loc of locations) {
        const lat = loc.Latitude || loc.latitude || loc.lat;
        const lng = loc.Longitude || loc.longitude || loc.lng || loc.lon;
        if (!lat || !lng) continue;
        records.push({
          vehicleId,
          organizationId: orgId,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          speed: parseFloat(loc.GpsSpeed || loc.Speed || loc.speed || 0),
          heading: parseFloat(loc.Heading || loc.Direction || loc.heading || loc.direction || 0),
          altitude: loc.Altitude || loc.altitude ? parseFloat(loc.Altitude || loc.altitude) : undefined,
          provider: Provider.KEEPTRACE,
          createdAt: new Date(loc.TimeStamp || loc.Date || loc.date || loc.timestamp || Date.now()),
          metadata: { source: 'backfill' },
        });
      }
    }

    if (records.length > 0) {
      await this.batchInsertHistory(records);
      this.logger.log(`  [KEEPTRACE] Backfilled ${records.length} positions for vehicle ${keeptraceVehicleId}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UBIWAN
  // ═══════════════════════════════════════════════════════════════════════

  private async discoverUbiwan(
    orgId: string,
    username: string,
    md5Password: string,
    license: string,
    serverKey: string,
    apiUrl: string,
  ): Promise<number> {
    if (!username || !md5Password || !license) return 0;

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
    const locResponse = await fetch(
      `${apiUrl}/v53/location?token=${encodeURIComponent(token)}&timestamp=0`,
      { headers: { Accept: 'application/json' } },
    );
    if (!locResponse.ok) throw new Error(`Ubiwan location ${locResponse.status}`);

    const locData = (await locResponse.json()) as any;
    const devices: any[] = locData.location?.data || [];
    const existing = await this.getExistingMetadataKeys('ubiwanId');

    let imported = 0;
    for (const dev of devices) {
      const uid = String(dev.uid);
      if (existing.has(uid)) continue;

      const registration = dev.registration || '';
      const summary = dev.summary || '';
      const imei = dev.dev_hw_id || '';
      const name = summary || `Ubiwan Device ${uid}`;
      const plate = registration || `UBIWAN-${uid}`;

      const vehicle = await this.vehiclesRepository.save(
        this.vehiclesRepository.create({
          organizationId: orgId,
          name,
          plate,
          brand: (summary.split(' ')[0]) || undefined,
          model: (summary.split(' ').slice(1).join(' ')) || undefined,
          deviceImei: imei || undefined,
          status: 'active' as any,
          metadata: { ubiwanId: uid, ubiwanParent: String(dev.uid_parent || ''), hardware: dev.hardware || '' },
        }),
      );
      imported++;
      this.logger.log(`  [UBIWAN][${orgId}] New device: ${name} (uid=${uid})`);

      this.seedUbiwanInitialPosition(vehicle.id, orgId, dev).catch((err) =>
        this.logger.error(`  [UBIWAN] Seed failed ${uid}: ${err.message}`),
      );
    }
    return imported;
  }

  private async seedUbiwanInitialPosition(vehicleId: string, orgId: string, device: any): Promise<void> {
    const lat = parseFloat(device.latitude);
    const lng = parseFloat(device.longitude);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

    await this.gpsHistoryRepository.save(
      this.gpsHistoryRepository.create({
        vehicleId,
        organizationId: orgId,
        lat,
        lng,
        speed: parseFloat(device.speed_current || 0),
        heading: parseFloat(device.course || 0),
        provider: Provider.UBIWAN,
        createdAt: device.location_date ? new Date(device.location_date * 1000) : new Date(),
        metadata: { source: 'discovery_seed' },
      }),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BACKFILL ALL EXISTING VEHICLES
  // ═══════════════════════════════════════════════════════════════════════

  async backfillAllExistingVehicles(): Promise<{ queued: number; skipped: number }> {
    this.logger.log('=== Backfill: scanning all vehicles for missing GPS history ===');

    const allVehicles = await this.vehiclesRepository.find();
    let queued = 0;
    let skipped = 0;

    // Load all org credentials into a map
    const allCreds = await this.providerCredentialsRepository.find({ where: { isActive: true } });
    const credMap = new Map<string, Map<Provider, Record<string, string>>>();
    for (const cred of allCreds) {
      if (!credMap.has(cred.organizationId)) credMap.set(cred.organizationId, new Map());
      credMap.get(cred.organizationId)!.set(cred.provider, cred.credentials);
    }

    // Also add env var fallback for default org
    if (!credMap.has(this.defaultOrgId)) {
      credMap.set(this.defaultOrgId, new Map());
    }
    const defaultMap = credMap.get(this.defaultOrgId)!;
    const flespiToken = this.configService.get<string>('FLESPI_TOKEN', '');
    if (flespiToken && !defaultMap.has(Provider.FLESPI)) {
      defaultMap.set(Provider.FLESPI, { token: flespiToken });
    }
    const echoesApiKey = this.configService.get<string>('ECHOES_API_KEY', '');
    const echoesAccountId = this.configService.get<string>('ECHOES_ACCOUNT_ID', '');
    if (echoesApiKey && echoesAccountId && !defaultMap.has(Provider.ECHOES)) {
      defaultMap.set(Provider.ECHOES, {
        apiKey: echoesApiKey,
        accountId: echoesAccountId,
        apiUrl: this.configService.get('ECHOES_API_URL', 'https://api.neutral-server.com'),
      });
    }
    const ktApiKey = this.configService.get<string>('KEEPTRACE_API_KEY', '');
    if (ktApiKey && !defaultMap.has(Provider.KEEPTRACE)) {
      defaultMap.set(Provider.KEEPTRACE, {
        apiKey: ktApiKey,
        apiUrl: this.configService.get('KEEPTRACE_API_URL', 'https://customerapi.live.keeptrace.fr'),
      });
    }

    for (const vehicle of allVehicles) {
      const meta = (vehicle.metadata || {}) as Record<string, string>;
      const orgCreds = credMap.get(vehicle.organizationId);

      const existingCount = await this.gpsHistoryRepository.count({ where: { vehicleId: vehicle.id } });
      if (existingCount > 10) { skipped++; continue; }

      if (meta.flespiChannelId) {
        const cred = orgCreds?.get(Provider.FLESPI);
        if (cred?.token) {
          this.backfillFlespiHistory(vehicle.id, vehicle.organizationId, meta.flespiChannelId, cred.token).catch(() => {});
          queued++;
          continue;
        }
      }

      if (meta.echoesUid) {
        const cred = orgCreds?.get(Provider.ECHOES);
        if (cred?.apiKey && cred?.accountId) {
          const apiUrl = cred.apiUrl || 'https://api.neutral-server.com';
          this.getEchoesPrivacyKey(cred.apiKey, cred.accountId, apiUrl)
            .then((pk) => this.backfillEchoesHistory(vehicle.id, vehicle.organizationId, meta.echoesUid, pk, cred.accountId, apiUrl))
            .catch(() => {});
          queued++;
          continue;
        }
      }

      if (meta.keeptraceId) {
        const cred = orgCreds?.get(Provider.KEEPTRACE);
        if (cred?.apiKey) {
          const apiUrl = cred.apiUrl || 'https://customerapi.live.keeptrace.fr';
          this.backfillKeepTraceHistory(vehicle.id, vehicle.organizationId, meta.keeptraceId, apiUrl, cred.apiKey).catch(() => {});
          queued++;
          continue;
        }
      }

      skipped++;
    }

    this.logger.log(`Backfill queued: ${queued}, skipped: ${skipped}`);
    return { queued, skipped };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  private async getExistingMetadataKeys(key: string): Promise<Set<string>> {
    const results = await this.vehiclesRepository
      .createQueryBuilder('v')
      .select(`v.metadata->>'${key}'`, 'extId')
      .where(`v.metadata->>'${key}' IS NOT NULL`)
      .getRawMany();
    return new Set(results.map((r) => r.extId));
  }

  private async batchInsertHistory(records: Partial<GpsHistoryEntity>[]): Promise<void> {
    for (let i = 0; i < records.length; i += 500) {
      const batch = records.slice(i, i + 500);
      await this.gpsHistoryRepository.save(
        batch.map((r) => this.gpsHistoryRepository.create(r)),
      );
    }
  }
}
