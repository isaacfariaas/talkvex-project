import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateMFASecret,
  verifyMFAToken,
  generateMFAToken,
} from "../mfa";
import { encrypt, decrypt } from "../crypto";

describe("MFA (TOTP)", () => {
  const testEmail = "user@example.com";

  beforeEach(() => {
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  describe("generateMFASecret", () => {
    it("should generate a valid MFA secret", () => {
      const result = generateMFASecret(testEmail);

      expect(result.secret).toBeDefined();
      expect(result.encryptedSecret).toBeDefined();
      expect(result.otpauthUrl).toBeDefined();
      expect(result.secret.length).toBeGreaterThan(0);
    });

    it("should generate an otpauth URL with correct format", () => {
      const result = generateMFASecret(testEmail);

      expect(result.otpauthUrl).toContain("otpauth://totp/");
      expect(result.otpauthUrl).toContain("Talkvex");
      expect(result.otpauthUrl).toContain(encodeURIComponent(testEmail));
      expect(result.otpauthUrl).toContain(`secret=${result.secret}`);
    });

    it("should encrypt the secret", () => {
      const result = generateMFASecret(testEmail);
      const decrypted = decrypt(result.encryptedSecret);

      expect(decrypted).toBe(result.secret);
    });

    it("should generate different secrets each time", () => {
      const result1 = generateMFASecret(testEmail);
      const result2 = generateMFASecret(testEmail);

      expect(result1.secret).not.toBe(result2.secret);
      expect(result1.encryptedSecret).not.toBe(result2.encryptedSecret);
    });
  });

  describe("verifyMFAToken", () => {
    it("should verify a valid token", () => {
      const { encryptedSecret } = generateMFASecret(testEmail);
      const token = generateMFAToken(encryptedSecret);

      const isValid = verifyMFAToken(encryptedSecret, token);

      expect(isValid).toBe(true);
    });

    it("should reject an invalid token", () => {
      const { encryptedSecret } = generateMFASecret(testEmail);
      const invalidToken = "000000";

      const isValid = verifyMFAToken(encryptedSecret, invalidToken);

      expect(isValid).toBe(false);
    });

    it("should reject a token with wrong format", () => {
      const { encryptedSecret } = generateMFASecret(testEmail);
      const invalidToken = "abc123";

      const isValid = verifyMFAToken(encryptedSecret, invalidToken);

      expect(isValid).toBe(false);
    });

    it("should handle decryption errors gracefully", () => {
      const invalidEncryptedSecret = "invalid:encrypted:data";
      const token = "123456";

      const isValid = verifyMFAToken(invalidEncryptedSecret, token);

      expect(isValid).toBe(false);
    });
  });

  describe("generateMFAToken", () => {
    it("should generate a 6-digit token", () => {
      const { encryptedSecret } = generateMFASecret(testEmail);
      const token = generateMFAToken(encryptedSecret);

      expect(token).toMatch(/^\d{6}$/);
    });

    it("should generate a token that can be verified", () => {
      const { encryptedSecret } = generateMFASecret(testEmail);
      const token = generateMFAToken(encryptedSecret);

      const isValid = verifyMFAToken(encryptedSecret, token);

      expect(isValid).toBe(true);
    });
  });

  describe("Integration with encryption", () => {
    it("should work with encrypted secrets end-to-end", () => {
      const { secret, encryptedSecret } = generateMFASecret(testEmail);

      const decryptedSecret = decrypt(encryptedSecret);
      expect(decryptedSecret).toBe(secret);

      const token = generateMFAToken(encryptedSecret);
      expect(verifyMFAToken(encryptedSecret, token)).toBe(true);
    });

    it("should handle missing encryption key gracefully", () => {
      delete process.env.ENCRYPTION_KEY;

      const result = generateMFASecret(testEmail);
      expect(result.encryptedSecret).toBe(result.secret);

      const token = generateMFAToken(result.encryptedSecret);
      expect(verifyMFAToken(result.encryptedSecret, token)).toBe(true);
    });
  });
});
