import { stagingConfig } from './staging.config';
import { productionConfig } from './production.config';
import { developmentConfig } from './development.config';

export type Environment = 'development' | 'staging' | 'production';

const environments = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

export function getEnvironmentConfig(env?: string) {
  const environment = (env || process.env.TEST_ENV || 'staging') as Environment;
  return environments[environment] || environments.staging;
}
