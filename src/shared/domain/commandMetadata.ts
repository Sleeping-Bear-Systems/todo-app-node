import type { EventMetadata } from "./eventMetadata.ts";

/**
 * Command metadata.
 */
export type CommandMetadata = Readonly<{
  correlationId: string;
  now: Date;
  userId: string;
}>;

/**
 * Converts a CommandMetadata instance into an EventMetadata instance.
 * @param commandMetadata The command metadata to convert.
 * @returns The event metadata derived from the command metadata.
 */
export function toEventMetadata(
  commandMetadata: CommandMetadata,
): EventMetadata {
  return {
    userId: commandMetadata.userId,
    now: commandMetadata.now,
    correlationId: commandMetadata.correlationId,
  };
}
