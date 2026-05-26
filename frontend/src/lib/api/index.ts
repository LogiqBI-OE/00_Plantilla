/** Re-exports del modulo API. Punto unico de entrada. */
export {
  api,
  ApiError,
  clearTokens,
  formatErrorDetail,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './client';

export { authApi } from './auth';
export type { LoginParams } from './auth';

export { usersApi } from './users';
export type { UserCreatePayload, UserUpdatePayload } from './users';

export { tenantsApi } from './tenants';
export type { AgencyTenantAccess } from './tenants';

export { levelsApi } from './levels';
export type { MatrixEntry } from './levels';

export { systemConfigApi } from './systemConfig';
export type { SystemConfigItem } from './systemConfig';

export { brandApi, globalBrandApi } from './brand';

export { auditApi } from './audit';
export type { AuditLog, AuditFilters } from './audit';

export type * from './types';
