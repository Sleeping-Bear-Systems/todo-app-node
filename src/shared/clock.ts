export interface Clock {
  readonly now: () => Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

export function createFixedClock(now: Date): Clock {
  return {
    now: () => now,
  } as const;
}
