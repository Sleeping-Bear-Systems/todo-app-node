/**
 * Maps the Task ID to the Task stream ID.
 * @param id Task ID.
 * @returns Task stream ID.
 */
export function mapToStreamId(id: string): string {
  return `task-${id}`;
}
