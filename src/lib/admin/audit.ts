/**
 * Auditní zápis.
 *
 * Železné pravidlo: chyba auditu nikdy neshodí akci, kterou audituje. Kdyby
 * `audit()` vyhodila výjimku, spadl by refund kvůli tomu, že se nepovedlo
 * zapsat, že refund proběhl – tedy přesně naopak, než jak to má být. Selhání
 * proto jen zalogujeme.
 *
 * Do `detail` nikdy nepatří hesla, tokeny ani hashe. Filtruje je `sanitize()`
 * níž, ale spoléhat se na to není omluva pro to je tam posílat.
 */
import { getDb, hasDatabaseUrl } from '../db/client';
import { auditLog } from '../db/schema';

export type AuditContext = {
  entity?: string | null;
  entityId?: string | null;
  detail?: unknown;
  ip?: string | null;
};

/** Klíče, jejichž hodnota se do auditu zapíše jako `"[skryto]"`. */
const SECRET_KEYS = /(heslo|password|passwd|token|secret|hash|authorization|cookie|otp|totp|pin)/i;

export async function audit(
  adminUserId: string | null,
  action: string,
  ctx: AuditContext = {},
): Promise<void> {
  if (!hasDatabaseUrl()) return;

  try {
    await getDb()
      .insert(auditLog)
      .values({
        adminUserId,
        action: action.slice(0, 128),
        entity: ctx.entity?.slice(0, 64) ?? null,
        entityId: ctx.entityId?.slice(0, 128) ?? null,
        detail: ctx.detail === undefined ? null : sanitize(ctx.detail),
        ip: ctx.ip?.slice(0, 64) ?? null,
      });
  } catch (err) {
    // Bez detailu vstupu – ten by mohl obsahovat citlivá data, která právě
    // proto do logu nechceme.
    console.error(`[admin/audit] zápis akce "${action}" selhal:`, err);
  }
}

/**
 * Poslední záchranná síť proti tomu, aby se do auditu dostalo heslo nebo token.
 * Rekurze má strop, ať nás cyklický objekt nepošle do nekonečna.
 */
function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[příliš hluboko]';
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (value instanceof Date) return value.toISOString();

  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SECRET_KEYS.test(key) ? '[skryto]' : sanitize(v, depth + 1);
  }
  return out;
}
