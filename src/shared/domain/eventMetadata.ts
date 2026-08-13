/**
 * Event metadata.
 */
export type EventMetadata = Readonly<{
  userId: string;
  correlationId: string;
  now: Date;
}>;
