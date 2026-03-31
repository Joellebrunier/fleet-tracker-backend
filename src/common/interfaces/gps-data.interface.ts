import { Provider } from '@common/enums/provider.enum';

export interface NormalizedGPSData {
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees 0-360
  altitude?: number; // meters
  timestamp: Date;
  provider: Provider;
  accuracy?: number; // meters
  raw?: Record<string, any>;
}
