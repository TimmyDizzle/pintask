import { describe, expect, it } from "vitest";
import { nextWeeklyPublishDate, validateScheduledPost } from "./blogSchedule";

describe("weekly article scheduling", () => {
  it("uses the next Thursday at 15:00 UTC", () => {
    expect(nextWeeklyPublishDate([], new Date("2026-11-19T16:00:00Z"))).toBe("2026-11-26T15:00:00.000Z");
  });
  it("keeps weekly slots seven days apart when a date is occupied", () => {
    expect(nextWeeklyPublishDate(["2026-11-26T15:00:00Z"], new Date("2026-11-19T16:00:00Z"))).toBe("2026-12-03T15:00:00.000Z");
  });
  it("requires a publication date for scheduled articles", () => {
    expect(() => validateScheduledPost("scheduled", null, "Article")).toThrow("Choose a publish date");
  });
  it("does not publish title-only drafts", () => {
    expect(() => validateScheduledPost("scheduled", "2026-11-26T15:00:00Z", " ")).toThrow("Add the article content");
  });
});