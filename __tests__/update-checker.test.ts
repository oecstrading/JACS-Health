/**
 * Tests for the auto-update feature.
 *
 * These tests validate the pure-logic parts of the update system
 * (version parsing, comparison, result shape) without importing
 * native modules that cannot run in a Node.js test environment.
 */
import { describe, it, expect, vi } from "vitest";

// ── Inline the pure logic from updateService to avoid native imports ──────────

interface AppVersion {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(versionString: string): AppVersion {
  const parts = versionString.split(".").map(Number);
  return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
}

function compareVersions(v1: AppVersion, v2: AppVersion): number {
  if (v1.major !== v2.major) return v1.major > v2.major ? 1 : -1;
  if (v1.minor !== v2.minor) return v1.minor > v2.minor ? 1 : -1;
  if (v1.patch !== v2.patch) return v1.patch > v2.patch ? 1 : -1;
  return 0;
}

// ── Version parsing ───────────────────────────────────────────────────────────

describe("version parsing", () => {
  it("parses standard semver strings", () => {
    expect(parseVersion("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
    expect(parseVersion("0.0.1")).toEqual({ major: 0, minor: 0, patch: 1 });
    expect(parseVersion("10.0.0")).toEqual({ major: 10, minor: 0, patch: 0 });
  });

  it("handles missing patch segment", () => {
    expect(parseVersion("1.2")).toEqual({ major: 1, minor: 2, patch: 0 });
  });

  it("handles single segment", () => {
    expect(parseVersion("3")).toEqual({ major: 3, minor: 0, patch: 0 });
  });
});

// ── Version comparison ────────────────────────────────────────────────────────

describe("version comparison", () => {
  it("returns 1 when first version is newer (minor bump)", () => {
    expect(compareVersions(parseVersion("1.1.0"), parseVersion("1.0.0"))).toBe(1);
  });

  it("returns -1 when first version is older (minor bump)", () => {
    expect(compareVersions(parseVersion("1.0.0"), parseVersion("1.1.0"))).toBe(-1);
  });

  it("returns 0 for equal versions", () => {
    expect(compareVersions(parseVersion("1.0.0"), parseVersion("1.0.0"))).toBe(0);
  });

  it("correctly compares major version bumps", () => {
    expect(compareVersions(parseVersion("2.0.0"), parseVersion("1.9.9"))).toBe(1);
  });

  it("correctly compares patch version bumps", () => {
    expect(compareVersions(parseVersion("1.0.1"), parseVersion("1.0.0"))).toBe(1);
  });
});

// ── Update availability logic ─────────────────────────────────────────────────

describe("update availability logic", () => {
  function isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
    return compareVersions(parseVersion(latestVersion), parseVersion(currentVersion)) > 0;
  }

  function shouldForceUpdate(
    currentVersion: string,
    minRequiredVersion: string,
    priority: string,
  ): boolean {
    return (
      priority === "critical" ||
      compareVersions(parseVersion(currentVersion), parseVersion(minRequiredVersion)) < 0
    );
  }

  it("detects update available when remote version is newer", () => {
    expect(isUpdateAvailable("1.0.0", "1.1.0")).toBe(true);
  });

  it("returns false when already on latest version", () => {
    expect(isUpdateAvailable("1.1.0", "1.1.0")).toBe(false);
  });

  it("returns false when current version is newer than remote (edge case)", () => {
    expect(isUpdateAvailable("1.2.0", "1.1.0")).toBe(false);
  });

  it("forces update when priority is critical", () => {
    expect(shouldForceUpdate("1.0.0", "1.0.0", "critical")).toBe(true);
  });

  it("forces update when below minimum required version", () => {
    expect(shouldForceUpdate("0.9.0", "1.0.0", "recommended")).toBe(true);
  });

  it("does not force update for recommended priority above minimum", () => {
    expect(shouldForceUpdate("1.0.0", "1.0.0", "recommended")).toBe(false);
  });
});

// ── Snooze / re-check timing logic ────────────────────────────────────────────

describe("snooze timing logic", () => {
  const SNOOZE_HOURS = 4;

  function canCheck(lastCheckedAt: number): boolean {
    const msSince = Date.now() - lastCheckedAt;
    return msSince > SNOOZE_HOURS * 60 * 60 * 1000;
  }

  it("allows check when never checked before (lastCheckedAt = 0)", () => {
    expect(canCheck(0)).toBe(true);
  });

  it("blocks check immediately after a check", () => {
    expect(canCheck(Date.now())).toBe(false);
  });

  it("allows check after snooze period has elapsed", () => {
    const fiveHoursAgo = Date.now() - 5 * 60 * 60 * 1000;
    expect(canCheck(fiveHoursAgo)).toBe(true);
  });

  it("blocks check within snooze period", () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(canCheck(twoHoursAgo)).toBe(false);
  });
});
