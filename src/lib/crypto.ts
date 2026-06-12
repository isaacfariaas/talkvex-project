import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY is not defined");
    }
    return null;
  }
  return Buffer.from(key, "hex");
}

/**
 * Encrypts text using AES-256-GCM.
 * The key must be a 64-character hex string (32 bytes).
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  if (!key) {
    return text; 
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts text using AES-256-GCM.
 */
export function decrypt(text: string): string {
  const key = getEncryptionKey();
  if (!key) {
    return text;
  }

  // If the text doesn't match the encrypted format (iv:tag:data), 
  // it might be an old unencrypted key.
  if (!text || !text.includes(":")) {
    return text;
  }

  try {
    const [ivHex, tagHex, encrypted] = text.split(":");
    if (!ivHex || !tagHex || !encrypted) {
      return text;
    }

    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return text;
  }
}
