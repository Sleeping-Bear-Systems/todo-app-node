export interface Clock {
  readonly now: () => Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

export function createFixedClock(fixedDate: Date): Clock {
  return {
    now: () => fixedDate,
  } as const;
}
