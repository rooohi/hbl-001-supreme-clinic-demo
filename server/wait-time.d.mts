export type WaitEntry = {
  id: string;
  status: "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "SKIPPED" | "NO_SHOW" | "LEFT";
  sequenceNumber: number;
  estimatedDurationSeconds: number;
  startedAt: number | null;
};

export type WaitEstimate = {
  id: string;
  estimatedStartAt: number;
  estimatedWaitSeconds: number;
};

export function estimateQueue(entries: WaitEntry[], now?: number): WaitEstimate[];
