import { ConfigType, configValidationSchema } from './validation.schema';

export interface IConfiguration extends ConfigType {
  isDevelopment: boolean;
  isProduction: boolean;
}

export function configuration(): IConfiguration {
  const envVars = process.env;

  try {
    const validated = configValidationSchema.parse(envVars);

    return {
      ...validated,
      isDevelopment: validated.NODE_ENV === 'development',
      isProduction: validated.NODE_ENV === 'production',
    };
  } catch (error: any) {
    console.error('Environment validation failed:', error.errors);
    throw new Error('Invalid environment configuration');
  }
}

export const getConfiguration = (): IConfiguration => configuration();
