// Biometrics & Passkeys Security Service for p-zeh
// Provides WebAuthn Face ID / Touch ID / Device PIN with biometric fallback

const PASSKEY_KEY = 'p_zeh_passkey_credential';
const HOST_PIN_KEY = 'p_zeh_host_pin';

export interface BiometricProfile {
  credentialId: string;
  userName: string;
  createdAt: string;
  hasFaceId: boolean;
}

/**
 * Check if the user's device supports WebAuthn Biometrics (Face ID, Touch ID, Windows Hello)
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Register or authenticate user via Face ID / Touch ID
 */
export async function authenticateWithBiometrics(userName: string): Promise<{ success: boolean; method: 'faceid' | 'pin'; error?: string }> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: true, method: 'pin' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Try WebAuthn Platform Authenticator (Face ID / Touch ID / Windows Hello)
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'p-zeh Owambe Pay', id: window.location.hostname },
        user: {
          id: new Uint8Array([1, 2, 3, 4]),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Face ID / Touch ID
          userVerification: 'required',
        },
        timeout: 60000,
      },
    });

    if (credential) {
      localStorage.setItem(PASSKEY_KEY, JSON.stringify({
        credentialId: credential.id,
        userName,
        createdAt: new Date().toISOString(),
        hasFaceId: true,
      }));
      return { success: true, method: 'faceid' };
    }

    return { success: true, method: 'pin' };
  } catch (err: any) {
    // If user cancelled or device doesn't support platform biometrics, fall back gracefully to PIN
    console.warn('WebAuthn prompt fallback:', err?.message);
    return { success: true, method: 'pin' };
  }
}

/**
 * Check or set Host Security PIN (Default: 1234)
 */
export function getHostSecurityPin(): string {
  try {
    return localStorage.getItem(HOST_PIN_KEY) || '1234';
  } catch {
    return '1234';
  }
}

export function setHostSecurityPin(newPin: string): void {
  try {
    localStorage.setItem(HOST_PIN_KEY, newPin);
  } catch {}
}

export function verifyHostPin(inputPin: string): boolean {
  return inputPin === getHostSecurityPin();
}
