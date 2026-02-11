/**
 * Toss Payments API helper
 *
 * Docs: https://docs.tosspayments.com/reference
 * Cancel: POST /v1/payments/{paymentKey}/cancel
 */

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY ?? "";
const TOSS_API_BASE = "https://api.tosspayments.com/v1";

function authHeader(): string {
  // Toss uses Basic auth with secretKey as username, empty password
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

export type TossCancelResult =
  | { ok: true; paymentKey: string }
  | { ok: false; code: string; message: string };

/**
 * Cancel (refund) an authorized/confirmed payment via Toss.
 *
 * Should be called OUTSIDE of DB transactions — network calls inside
 * a transaction will hold the connection open and risk timeouts.
 *
 * If TOSS_SECRET_KEY is not configured, logs a warning and returns
 * ok:false so callers can proceed gracefully in development.
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
): Promise<TossCancelResult> {
  if (!TOSS_SECRET_KEY) {
    console.warn(
      "[toss] TOSS_SECRET_KEY not set — skipping cancel API call for paymentKey:",
      paymentKey,
    );
    return {
      ok: false,
      code: "TOSS_NOT_CONFIGURED",
      message: "Toss API key not configured",
    };
  }

  try {
    const res = await fetch(
      `${TOSS_API_BASE}/payments/${encodeURIComponent(paymentKey)}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancelReason }),
      },
    );

    if (res.ok) {
      return { ok: true, paymentKey };
    }

    // Toss returns { code, message } on error
    const errBody = (await res.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };

    console.error("[toss] cancel failed:", res.status, errBody);

    return {
      ok: false,
      code: errBody.code ?? `HTTP_${res.status}`,
      message: errBody.message ?? "Toss cancel request failed",
    };
  } catch (err) {
    console.error("[toss] cancel network error:", err);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}
