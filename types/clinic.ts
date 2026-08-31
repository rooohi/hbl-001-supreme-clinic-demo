export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "ARRIVED" | "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "SKIPPED";
export type QueueStatus = "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "SKIPPED" | "NO_SHOW" | "LEFT";

export type Appointment = {
  id: string;
  status: AppointmentStatus;
  type: string;
  source: string;
  serviceName: string;
  durationMinutes: number;
  scheduledAt: number;
  reason?: string | null;
  notes?: string | null;
  rowVersion: number;
  patientId?: string;
  patientName: string;
  patientNumber: string;
  phoneLast4: string;
};

export type QueueEntry = {
  id: string;
  queueId?: string;
  appointmentId: string;
  tokenNumber: number;
  sequenceNumber: number;
  status: QueueStatus;
  estimatedDurationSeconds: number;
  estimatedStartAt?: number | null;
  estimatedWaitSeconds: number | null;
  startedAt?: number | null;
  rowVersion: number;
  patientId?: string;
  patientName: string;
  patientNumber?: string;
  serviceName: string;
  scheduledAt?: number;
};

export type FollowUp = {
  id: string;
  status: "UPCOMING" | "DUE" | "OVERDUE" | "BOOKED" | "COMPLETED" | "DISMISSED";
  intervalCode: string;
  dueDate: string;
  note: string | null;
  patientName: string;
  patientNumber: string;
  phoneLast4?: string;
  phone?: string;
  serviceId?: string | null;
  bookedAppointmentId?: string | null;
};

export type DashboardData = {
  date: string;
  actor: { name: string; role: string };
  metrics: {
    appointments: number;
    completed: number;
    waiting: number;
    cancelled: number;
    noShows: number;
    newPatients: number;
    followUpsDue: number;
    averageWait: number;
    activePatients: number;
  };
  appointments: Appointment[];
  queue: QueueEntry[];
  followUps: FollowUp[];
  configuration: {
    data: string;
    realtime: string;
    communications: string;
  };
};

export type ClinicService = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  bufferMinutes: number;
  pricePaise: number | null;
  currency: string;
  bookingMode: "PUBLIC" | "STAFF_ONLY" | "REFERRAL";
  instructions: string | null;
};

export async function apiJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload;
}
