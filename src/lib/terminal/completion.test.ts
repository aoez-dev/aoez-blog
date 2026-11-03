import { describe, expect, it } from "vitest";
import { commandList, startTab, stepTab, tabValue } from "./completion";
import { fixture } from "./testData";

const all = commandList(fixture.posts);

describe("tab completion", () => {
  it("starts at the placeholder example when the prompt is empty", () => {
    const tab = startTab(all, "", "/theme", false);
    expect(tabValue(tab)).toBe("/theme");
    expect(tab.list).toHaveLength(all.length);
  });

  it("narrows by what was typed and skips the exact match", () => {
    const tab = startTab(all, "!ls posts/", "", false);
    expect(tab.list).toEqual(["!ls posts/", "!ls posts/ -l"]);
    expect(tabValue(tab)).toBe("!ls posts/ -l");
  });

  it("wraps around in both directions", () => {
    let tab = startTab(all, "/", "", false);
    const n = tab.list.length;
    for (let i = 0; i < n; i++) tab = stepTab(tab, false);
    expect(tab.index).toBe(0);
    expect(stepTab(tab, true).index).toBe(n - 1);
  });

  it("does nothing when nothing matches", () => {
    expect(startTab(all, "/zzz", "", false).on).toBe(false);
  });
});
