/**
 * @vitest-environment node
 */
import { encrypt, decrypt } from "../crypto";
import { describe, it, expect, beforeAll } from "vitest";

describe("crypto utils", () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  it("should encrypt and decrypt correctly", () => {
    const text = "test-api-key-123";
    const encrypted = encrypt(text);
    expect(encrypted).not.toBe(text);
    expect(encrypted.split(":")).toHaveLength(3);
    
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it("should handle unencrypted text gracefully", () => {
    const text = "plain-text-key";
    const decrypted = decrypt(text);
    expect(decrypted).toBe(text);
  });

  it("should throw error in production if no key is defined", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalKey = process.env.ENCRYPTION_KEY;
    
    process.env.NODE_ENV = "production";
    delete process.env.ENCRYPTION_KEY;
    
    expect(() => encrypt("secret")).toThrow("ENCRYPTION_KEY is not defined");
    
    process.env.NODE_ENV = originalEnv;
    process.env.ENCRYPTION_KEY = originalKey;
  });
});
