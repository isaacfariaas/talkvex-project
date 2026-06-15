import { authenticator } from "otplib";
import { encrypt, decrypt } from "./crypto";

/**
 * Generates a new TOTP secret for MFA setup.
 * Returns the encrypted secret and the otpauth URL for QR code generation.
 */
export function generateMFASecret(userEmail: string): {
  encryptedSecret: string;
  secret: string;
  otpauthUrl: string;
} {
  const secret = authenticator.generateSecret();
  const encryptedSecret = encrypt(secret);
  const otpauthUrl = authenticator.keyuri(userEmail, "Talkvex", secret);

  return {
    encryptedSecret,
    secret,
    otpauthUrl,
  };
}

/**
 * Verifies a TOTP token against an encrypted secret.
 */
export function verifyMFAToken(
  encryptedSecret: string,
  token: string
): boolean {
  try {
    const secret = decrypt(encryptedSecret);
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error("MFA verification failed:", error);
    return false;
  }
}

/**
 * Generates a TOTP token for testing purposes.
 * DO NOT use in production code - only for tests.
 */
export function generateMFAToken(encryptedSecret: string): string {
  const secret = decrypt(encryptedSecret);
  return authenticator.generate(secret);
}
