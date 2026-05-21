/**
 * Google AdSense configuration.
 *
 * Replace these placeholders with your real ad slot IDs after your AdSense
 * account is approved and you have created ad units.
 */
export const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined) ?? "";

export const AD_SLOTS = {
  /** Blog index — top banner */
  blogIndexTop: "1111111111",
  /** Blog index — inline/footer */
  blogIndexInline: "2222222222",
  /** Trello alternative page */
  trelloPage: "3333333333",
  /** Task tracker page */
  taskTrackerPage: "4444444444",
  /** Blog post page */
  blogPost: "5555555555",
} as const;
