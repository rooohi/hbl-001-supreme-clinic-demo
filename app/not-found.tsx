import Link from "@/components/native-link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="empty-state">
        <span className="eyebrow">404</span>
        <h1>We could not find that page.</h1>
        <p>Return to the clinic command center or start a patient booking.</p>
        <div className="button-row">
          <Link className="primary-button" href="/">Command center</Link>
          <Link className="secondary-button" href="/book">Book an appointment</Link>
        </div>
      </div>
    </main>
  );
}
