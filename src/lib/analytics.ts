import { track } from '@vercel/analytics';

/**
 * The full funnel vocabulary. Kept as a closed union so a typo in a call site
 * is a type error rather than a silently-missing metric.
 *
 * Drop-off is derived as `brief_started` minus `brief_submitted` — there is no
 * per-field instrumentation.
 */
export type AnalyticsEvent =
  | 'cta_start_project'
  | 'brief_started'
  | 'brief_submitted'
  | 'telegram_click'
  | 'verify_link_click'
  | 'promptstation_click'
  | 'hire_page_view';

/**
 * Fire-and-forget. Analytics must never break a user flow, so failures are
 * swallowed: an ad blocker eating the request is not an error worth surfacing.
 */
export function trackEvent(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean | null>
): void {
  try {
    track(event, props);
  } catch {
    /* ignore */
  }
}
