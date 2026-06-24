export async function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $lib: "invoicesignal-server" },
      }),
    });
  } catch {
    // ne pas bloquer si posthog est indisponible
  }
}
