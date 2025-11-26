import { LogtoConfig, UserScope } from '@logto/react';

/**
 * Logto authentication configuration
 *
 * To use Logto authentication:
 * 1. Sign up for Logto at https://logto.io or set up self-hosted instance
 * 2. Create an application in Logto Console
 * 3. Update the configuration below with your Logto application details
 * 4. Add custom claim "siteCode" or "siteId" to user profile in Logto
 */

export const logtoConfig: LogtoConfig = {
  // Logto endpoint - Replace with your Logto instance URL
  // Examples:
  // - Cloud: https://your-tenant.logto.app
  // - Self-hosted: https://logto.yourdomain.com
  endpoint: import.meta.env.VITE_LOGTO_ENDPOINT || 'http://localhost:3001',

  // Application ID from Logto Console
  appId: import.meta.env.VITE_LOGTO_APP_ID || '50u1lepjab2k72ijjf6li',

  // OAuth scopes to request
  scopes: [
    UserScope.Email,
    UserScope.Profile,
    UserScope.CustomData, // For site assignment
  ],

  // Resources (API identifiers) - optional
  resources: [
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  ],
};

/**
 * Frontend redirect URIs (must be configured in Logto Console)
 */
export const logtoRedirectUris = {
  signIn: `${window.location.origin}/auth/callback`,
  signOut: `${window.location.origin}/`,
};

/**
 * Site assignment strategy
 *
 * Options:
 * 1. 'custom-claim': Read siteCode/siteId from Logto custom claims
 * 2. 'user-selection': Let user select site after login
 * 3. 'admin-mapping': Admin assigns site in backend
 */
export const siteAssignmentStrategy: 'custom-claim' | 'user-selection' | 'admin-mapping' = 'user-selection';

/**
 * Extract site identifier from Logto claims
 */
export function extractSiteFromClaims(claims: Record<string, unknown>): string | null {
  // Try custom claim first
  if (claims.siteCode && typeof claims.siteCode === 'string') {
    return claims.siteCode;
  }

  // Try siteId
  if (claims.siteId && typeof claims.siteId === 'string') {
    return claims.siteId;
  }

  // Fallback to default or user selection
  return null;
}
