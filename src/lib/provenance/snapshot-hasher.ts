/**
 * CardIntel — Cryptographic Snapshot & Integrity Engine
 *
 * Computes exact SHA-256 digests, byte counts, and provenance metadata
 * from actual captured source document content.
 *
 * CRITICAL RULE: Never invent or placeholder SHA-256 hashes.
 * Hash must always be: crypto.createHash("sha256").update(bytes).digest("hex")
 */

import { createHash } from "crypto";

export interface SnapshotDigest {
  contentHash: string; // 64-char lowercase hex
  algorithm: "SHA-256";
  byteLength: number;
  contentLengthChars: number;
  retrievedAt: string;
}

/**
 * Computes deterministic SHA-256 hash and byte length from content
 */
export function computeSnapshotHash(content: string | Buffer): SnapshotDigest {
  const buffer = typeof content === "string" ? Buffer.from(content, "utf-8") : content;
  const hash = createHash("sha256").update(buffer).digest("hex");

  return {
    contentHash: hash,
    algorithm: "SHA-256",
    byteLength: buffer.byteLength,
    contentLengthChars: typeof content === "string" ? content.length : buffer.length,
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Validates whether a provided hash matches the exact content
 */
export function verifySnapshotIntegrity(content: string | Buffer, expectedHash: string): boolean {
  const actual = computeSnapshotHash(content);
  return actual.contentHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Checks if a given hash is the known empty string SHA-256 digest or invalid pattern
 */
export function isInvalidOrPlaceholderHash(hash: string): boolean {
  const EMPTY_STRING_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  if (!hash || hash.length !== 64) return true;
  if (hash === EMPTY_STRING_SHA256) return true;

  // Check for suspicious repeating patterns (e.g. 1029384756 repeating)
  if (/(1029384756|1234567890|abcdef)/i.test(hash) && hash.slice(32) === hash.slice(0, 32)) {
    return true;
  }

  return false;
}
