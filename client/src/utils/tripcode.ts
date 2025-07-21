// client/src/utils/tripcode.ts

/**
 * A simple “tripcode” generator: hashes the secret and returns
 * the last 10 characters of a base-64–encoded SHA-1 digest.
 */
export async function generateTripcode(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64 = btoa(String.fromCharCode(...hashArray));
  // Take last 10 chars (ignoring padding)
  return base64.replace(/=+$/, "").slice(-10);
}
