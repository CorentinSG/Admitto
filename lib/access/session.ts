/**
 * Accès à l'espace payant (CDC §10 et §21).
 *
 * Mesure de transition, sur le même principe que le back-office : fermée par
 * défaut. Sans `ADMITTO_SESSION_SECRET`, aucun jeton ne peut être émis ni
 * vérifié, et `/app` reste inaccessible.
 *
 * Le jeton porte l'identifiant de l'évaluation : c'est ce qui garantit qu'après
 * achat l'utilisateur retrouve son profil sans rien ressaisir — exigence du
 * CDC §10. À remplacer par Auth.js avec comptes et rôles en Phase 3.
 *
 * Signature via Web Crypto et non `node:crypto` : ce module est importé par le
 * middleware, qui s'exécute dans le runtime Edge où les modules Node ne sont
 * pas disponibles. Les fonctions sont donc asynchrones.
 */

export const ACCESS_COOKIE = "admitto_access";

/** Durée de validité du jeton d'accès, en jours. */
export const ACCESS_DAYS = 30;

export function sessionSecret(): string | null {
  return process.env.ADMITTO_SESSION_SECRET || null;
}

const encoder = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): ArrayBuffer | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) return null;
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return buffer;
}

/** Émet un jeton `assessmentId.expiry.signature`. */
export async function issueAccessToken(
  assessmentId: string,
  issuedAt: Date
): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret) return null;

  const expiry = new Date(issuedAt);
  expiry.setUTCDate(expiry.getUTCDate() + ACCESS_DAYS);
  const payload = `${assessmentId}.${Math.floor(expiry.getTime() / 1000)}`;

  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload));
  return `${payload}.${toHex(signature)}`;
}

/**
 * Vérifie un jeton et retourne l'identifiant d'évaluation. Retourne `null` sur
 * signature invalide, jeton expiré, ou secret absent — jamais d'exception, pour
 * que l'appelant traite tous les échecs de la même façon.
 *
 * La comparaison passe par `crypto.subtle.verify`, qui ne fuite pas la
 * signature attendue octet par octet.
 */
export async function verifyAccessToken(
  token: string | undefined,
  now: Date
): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [assessmentId, expiryTs, provided] = parts;
  const signature = fromHex(provided);
  if (!signature) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    signature,
    encoder.encode(`${assessmentId}.${expiryTs}`)
  );
  if (!valid) return null;

  const expiry = Number(expiryTs);
  if (!Number.isFinite(expiry) || Math.floor(now.getTime() / 1000) > expiry) return null;

  return assessmentId;
}
