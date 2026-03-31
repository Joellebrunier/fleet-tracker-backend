import { Injectable } from '@nestjs/common';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';
import { Provider } from '@common/enums/provider.enum';

@Injectable()
export class DataNormalizerService {
  normalizeFromFlespi(data: any, vehicleId: string): NormalizedGPSData {
    return {
      vehicleId,
      lat: data.position?.latitude || 0,
      lng: data.position?.longitude || 0,
      speed: this.convertSpeed(data.position?.speed || 0, 'kmh'),
      heading: data.position?.direction || 0,
      altitude: data.position?.altitude,
      accuracy: data.position?.accuracy,
      timestamp: new Date(data.timestamp || Date.now()),
      provider: Provider.FLESPI,
      raw: data,
    };
  }

  normalizeFromEchoes(data: any, vehicleId: string): NormalizedGPSData {
    return {
      vehicleId,
      lat: data.lat || 0,
      lng: data.lng || 0,
      speed: this.convertSpeed(data.speed || 0, 'kmh'),
      heading: data.heading || 0,
      altitude: data.altitude,
      accuracy: data.accuracy,
      timestamp: new Date(data.timestamp || Date.now()),
      provider: Provider.ECHOES,
      raw: data,
    };
  }

  normalizeFromUbiwan(data: any, vehicleId: string): NormalizedGPSData {
    return {
      vehicleId,
      lat: data.gps?.latitude || 0,
      lng: data.gps?.longitude || 0,
      speed: this.convertSpeed(data.gps?.speed || 0, 'kmh'),
      heading: data.gps?.heading || 0,
      altitude: data.gps?.altitude,
      accuracy: data.gps?.accuracy,
      timestamp: new Date(data.gps?.timestamp || Date.now()),
      provider: Provider.UBIWAN,
      raw: data,
    };
  }

  normalizeFromKeepTrace(data: any, vehicleId: string): NormalizedGPSData {
    return {
      vehicleId,
      lat: data.location?.latitude || 0,
      lng: data.location?.longitude || 0,
      speed: this.convertSpeed(data.location?.speed || 0, 'kmh'),
      heading: data.location?.heading || 0,
      altitude: data.location?.altitude,
      accuracy: data.location?.accuracy,
      timestamp: new Date(data.location?.timestamp || Date.now()),
      provider: Provider.KEEPTRACE,
      raw: data,
    };
  }

  validate(data: NormalizedGPSData): boolean {
    if (!data.vehicleId) return false;
    if (typeof data.lat !== 'number' || typeof data.lng !== 'number') return false;
    if (data.lat < -90 || data.lat > 90 || data.lng < -180 || data.lng > 180) return false;
    if (typeof data.speed !== 'number' || data.speed < 0) return false;
    if (typeof data.heading !== 'number' || data.heading < 0 || data.heading > 360) return false;
    return true;
  }

  private convertSpeed(speed: number, unit: string): number {
    // Convert to km/h
    switch (unit) {
      case 'kmh':
        return speed;
      case 'ms':
        return speed * 3.6;
      case 'mph':
        return speed * 1.60934;
      default:
        return speed;
    }
  }
}
