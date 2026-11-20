/**
 * Amazon Cognito & Local Developer Authentication Service.
 * Manages JWT tokens, login flow, and authentication headers for the Artist Admin Panel.
 */

export interface AuthSession {
  token: string;
  email: string;
  expiresAt: number;
}

const TOKEN_KEY = 'nsg_admin_token';
const EMAIL_KEY = 'nsg_admin_email';

export async function loginArtist(email: string, password: string): Promise<AuthSession> {
  // If credentials match standard demo or Cognito credentials
  // For AWS Cognito integration in production:
  const cognitoClientId = (window as any).__ENV__?.VITE_COGNITO_CLIENT_ID || '';
  const cognitoRegion = (window as any).__ENV__?.VITE_AWS_REGION || 'eu-central-1';

  if (cognitoClientId) {
    const res = await fetch(`https://cognito-idp.${cognitoRegion}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: cognitoClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.AuthenticationResult) {
      const token = data.AuthenticationResult.IdToken || data.AuthenticationResult.AccessToken;
      const session: AuthSession = {
        token,
        email,
        expiresAt: Date.now() + (data.AuthenticationResult.ExpiresIn || 3600) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(EMAIL_KEY, session.email);
      return session;
    }

    throw new Error(data.message || 'Невірний логін або пароль. Перевірте введені дані.');
  }

  // Local development only (when Cognito is not configured in env.js)
  const isLocalDev =
    Boolean((import.meta as any).env?.DEV) &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocalDev && password.length >= 6) {
    const session: AuthSession = {
      token: `dev-admin-token-${Date.now()}`,
      email: email || 'sculptures.zh@gmail.com',
      expiresAt: Date.now() + 86400 * 1000,
    };
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(EMAIL_KEY, session.email);
    return session;
  }

  throw new Error('Невірний логін або пароль. Перевірте введені дані.');
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const email = localStorage.getItem(EMAIL_KEY);
  if (!token) return null;

  return {
    token,
    email: email || 'sculptures.zh@gmail.com',
    expiresAt: Date.now() + 86400 * 1000,
  };
}

export function logoutArtist(): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }
}
