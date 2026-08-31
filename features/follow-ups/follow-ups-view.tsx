"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { AppointmentForm } from "@/features/appointments/appointment-form";
import { apiJson, type FollowUp } from "@/types/clinic";

type FollowUpAction = "COMPLETE" | "DISMISS" | "BOOK";

export function FollowUpsView() {
  const client = useQueryClient();
  const [booking, setBooking] = useState<FollowUp | null>(null);
  const [messageTarget, setMessageTarget] = useState<FollowUp | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["follow-ups"],
    queryFn: () => apiJson<{ followUps: FollowUp[] }>("/api/follow-ups"),
  });
  const mutation = useMutation({
    mutationFn: ({ id, action, appointmentId }: { id: string; action: FollowUpAction; appointmentId?: string }) =>
      apiJson("/api/follow-ups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action, appointmentId }),
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["follow-ups"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (query.isError) {
    return (
      <section className="error-state">
        <TriangleAlert />
        <h2>Follow-ups could not load</h2>
        <p>{query.error.message}</p>
        <button type="button" onClick={() => query.refetch()}><RefreshCw />Try again</button>
      </section>
    );
  }

  const items = query.data?.followUps ?? [];
  const groups = ["OVERDUE", "DUE", "UPCOMING", "BOOKED", "COMPLETED"] as const;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p>Retention workflow</p><h2>Follow-ups</h2><span>Every recommended return has a clear owner and status.</span></div>
        <div className="conversion-pill"><RotateCcw /><span><b>{items.filter((item) => item.status === "BOOKED" || item.status === "COMPLETED").length}</b> recovered or completed</span></div>
      </section>
      {notice && <div className="success-banner"><CheckCircle2 /><span>{notice}</span></div>}
      <section className="followup-summary">
        <article><Clock3 /><span><b>{items.filter((item) => item.status === "OVERDUE").length}</b>Overdue</span></article>
        <article><CalendarCheck /><span><b>{items.filter((item) => item.status === "DUE").length}</b>Due today</span></article>
        <article><CheckCircle2 /><span><b>{items.filter((item) => item.status === "COMPLETED").length}</b>Completed</span></article>
      </section>
      <div className="followup-board">
        {groups.map((group) => {
          const groupItems = items.filter((item) => item.status === group);
          if (!groupItems.length && group !== "DUE") return null;
          return (
            <section className="panel followup-group" key={group}>
              <header>
                <div><p className="eyebrow">{group}</p><h3>{group === "OVERDUE" ? "Needs attention" : group === "DUE" ? "Due today" : group[0] + group.slice(1).toLowerCase()}</h3></div>
                <span>{groupItems.length}</span>
              </header>
              {groupItems.length ? groupItems.map((item) => (
                <article key={item.id}>
                  <span className="avatar">{item.patientName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                  <div><b>{item.patientName}</b><small>{item.patientNumber} · •••• {item.phoneLast4}</small><p>{item.note}</p></div>
                  <time>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${item.dueDate}T12:00:00+05:30`))}</time>
                  <div className="followup-actions">
                    <button type="button" onClick={() => setMessageTarget(item)} aria-label={`Prepare follow-up message for ${item.patientName}`} title="Prepare manual WhatsApp message"><MessageCircle /></button>
                    {!(["BOOKED", "COMPLETED"] as string[]).includes(item.status) && <button type="button" onClick={() => setBooking(item)}><CalendarPlus />Rebook</button>}
                    <button type="button" onClick={() => mutation.mutate({ id: item.id, action: "COMPLETE" })}><CheckCircle2 />Complete</button>
                  </div>
                </article>
              )) : <div className="empty-state compact"><CheckCircle2 /><h3>No follow-ups due</h3><p>The worklist is clear for today.</p></div>}
            </section>
          );
        })}
      </div>
      {booking && (
        <div className="modal-backdrop appointment-modal">
          <section role="dialog" aria-modal="true" aria-label={`Rebook ${booking.patientName}`}>
            <AppointmentForm
              initialValues={{
                patientName: booking.patientName,
                phone: booking.phone,
                serviceId: booking.serviceId ?? undefined,
                type: "FOLLOW_UP",
                reason: "Scheduled from follow-up worklist",
              }}
              onClose={() => setBooking(null)}
              onCreated={(result) => {
                mutation.mutate({ id: booking.id, action: "BOOK", appointmentId: result.id }, {
                  onSuccess: () => {
                    setNotice(`${booking.patientName} was rebooked and linked to this follow-up.`);
                    setBooking(null);
                  },
                });
              }}
            />
          </section>
        </div>
      )}
      {messageTarget && (() => {
        const text = `Hello ${messageTarget.patientName}, this is Twacha Clinic. Your recommended follow-up is due ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(`${messageTarget.dueDate}T12:00:00+05:30`))}. Please reply or call the clinic to choose a suitable appointment time.`;
        const whatsapp = messageTarget.phone ? `https://wa.me/${messageTarget.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}` : null;
        return <div className="modal-backdrop appointment-modal">
          <section role="dialog" aria-modal="true" aria-label={`Message ${messageTarget.patientName}`} className="manual-message-dialog">
            <header><div><p className="eyebrow">MANUAL FOLLOW-UP</p><h3>Message {messageTarget.patientName}</h3></div><button type="button" aria-label="Close message" onClick={() => setMessageTarget(null)}><X /></button></header>
            <p>Automated delivery is not configured. Review this patient-specific draft, then copy it or continue to WhatsApp yourself.</p>
            <textarea rows={6} readOnly value={text} aria-label="Prepared follow-up message" />
            <footer><button type="button" className="secondary-button" onClick={async () => { await navigator.clipboard.writeText(text); setNotice(`Message for ${messageTarget.patientName} copied.`); }}><Copy />Copy message</button>{whatsapp ? <a className="primary-button" href={whatsapp} target="_blank" rel="noreferrer"><ExternalLink />Open WhatsApp</a> : <button type="button" className="primary-button" onClick={() => setNotice("This patient record does not contain a callable mobile number.")}><MessageCircle />Check contact</button>}</footer>
          </section>
        </div>;
      })()}
    </div>
  );
}
