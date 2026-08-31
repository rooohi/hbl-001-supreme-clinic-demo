import { BookingStatus } from "@/features/booking/booking-status";
export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BookingStatus id={id} />; }
