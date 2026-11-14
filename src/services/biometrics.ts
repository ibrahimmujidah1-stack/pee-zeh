// Biometrics & Passkeys Security Service for p-zeh
// Provides WebAuthn Face ID / Touch ID / Device PIN with biometric fallback

const PASSKEY_KEY = 'p_zeh_passkey_credential_v3';
const HOST_PIN_KEY = 'p_zeh_host_pin_v3';

export interface BiometricProfile {
  credentialId: string;
  userName: string;
  createdAt: string;
  hasFaceId: boolean;
}

/**
 * Check if the host has created their personal PIN
 */
export function hasCustomHostPin(): boolean {
  try {
    const pin = localStorage.getItem(HOST_PIN_KEY);
    return Boolean(pin && pin.length === 4);
  } catch {
    return false;
  }
}

/**
 * Get Host Security PIN
 */
export function getHostSecurityPin(): string {
  try {
    return localStorage.getItem(HOST_PIN_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save Host Security PIN
 */
export function setHostSecurityPin(newPin: string): boolean {
  if (!newPin || newPin.length !== 4) return false;
  try {
    localStorage.setItem(HOST_PIN_KEY, newPin);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify Host Security PIN
 */
export function verifyHostPin(inputPin: string): boolean {
  const currentPin = getHostSecurityPin();
  if (!currentPin) {
    // If no pin has been explicitly set yet, accept valid 4 digits
    return inputPin.length === 4;
  }
  return inputPin === currentPin;
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
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname);
    // WebAuthn requires a domain or standard localhost, not a raw IP address
    if (isIp && window.location.hostname !== 'localhost') {
      return { success: true, method: 'pin' };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const rpOptions: any = {
      name: 'p-zeh Owambe Pay',
    };
    if (window.location.hostname && !isIp) {
      rpOptions.id = window.location.hostname;
    }

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: rpOptions,
        user: {
          id: new Uint8Array([1, 2, 3, 4]),
          name: userName || 'Host',
          displayName: userName || 'Host',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Face ID / Touch ID
          userVerification: 'preferred',
        },
        timeout: 30000,
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
    console.warn('Biometrics check bypassed safely:', err?.message);
    return { success: true, method: 'pin' };
  }
}
