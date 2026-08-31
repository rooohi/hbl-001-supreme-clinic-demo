import Link from "@/components/native-link";
import { CalendarSearch } from "lucide-react";
export default function TrackStartPage() { return <main className="booking-site"><section className="track-start"><CalendarSearch /><h1>Open your booking link</h1><p>For privacy, Twacha sends each patient a unique booking-status link. Open the link from your confirmation message or contact the clinic.</p><Link href="/book">Book a new appointment</Link></section></main>; }
