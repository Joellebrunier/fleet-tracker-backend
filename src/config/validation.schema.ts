import { z } from 'zod';

export const configValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  // Supabase
  SUPABASE_URL: z.string().default(''),
  SUPABASE_ANON_KEY: z.string().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(''),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().default('fleet-tracker_jwt_secret_change_in_production'),
  JWT_EXPIRATION: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().default('fleet-tracker_refresh_secret_change_in_production'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // GPS Providers - all optional (adapters auto-disable if not configured)
  FLESPI_TOKEN: z.string().default(''),
  FLESPI_MQTT_HOST: z.string().default('mqtt.flespi.io'),
  FLESPI_MQTT_PORT: z.coerce.number().default(8883),

  ECHOES_API_URL: z.string().default('https://api.neutral-server.com'),
  ECHOES_ACCOUNT_ID: z.string().default(''),
  ECHOES_API_KEY: z.string().default(''),

  UBIWAN_API_URL: z.string().default('https://api.ubiwan.net'),
  UBIWAN_USERNAME: z.string().default(''),
  UBIWAN_PASSWORD: z.string().default(''),
  UBIWAN_SERVER_NAME: z.string().default('Phoenix'),
  UBIWAN_SERVER_KEY: z.string().default(''),
  UBIWAN_ACCOUNT_NAME: z.string().default(''),
  UBIWAN_LICENSE: z.string().default(''),

  KEEPTRACE_API_URL: z.string().default('https://customerapi.live.keeptrace.fr'),
  KEEPTRACE_API_KEY: z.string().default(''),

  // Mapbox
  MAPBOX_TOKEN: z.string().default(''),

  // Email
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  SMTP_FROM_EMAIL: z.string().default('noreply@fleet-tracker.app'),

  // Workers
  BULL_QUEUE_ATTEMPTS: z.coerce.number().default(3),
  BULL_QUEUE_BACKOFF_DELAY: z.coerce.number().default(5000),
});

export type ConfigType = z.infer<typeof configValidationSchema>;
