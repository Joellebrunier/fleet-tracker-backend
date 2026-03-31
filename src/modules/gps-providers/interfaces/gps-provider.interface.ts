import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

export interface IGpsProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onData(callback: (data: NormalizedGPSData) => void): void;
  getStatus(): Promise<{
    connected: boolean;
    lastUpdate?: Date;
    vehicleCount?: number;
  }>;
}
