import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createFixedClock } from "./clock.js";

describe("createFixedClock", () => {
  test("now returns the fixed date", () => {
    const fixedDate = new Date("2026-05-28T12:00:00Z");
    const clock = createFixedClock(fixedDate);
    const result = clock.now();

    assert.equal(result.getTime(), fixedDate.getTime());
  });

  test("now returns the same date on multiple calls", () => {
    const fixedDate = new Date("2026-05-28T12:00:00Z");
    const clock = createFixedClock(fixedDate);

    const first = clock.now();
    const second = clock.now();
    const third = clock.now();

    assert.equal(first.getTime(), second.getTime());
    assert.equal(second.getTime(), third.getTime());
  });

  test("different clocks can have different fixed dates", () => {
    const date1 = new Date("2026-05-28T12:00:00Z");
    const date2 = new Date("2026-05-29T12:00:00Z");

    const clock1 = createFixedClock(date1);
    const clock2 = createFixedClock(date2);

    assert.notEqual(clock1.now().getTime(), clock2.now().getTime());
  });
});
