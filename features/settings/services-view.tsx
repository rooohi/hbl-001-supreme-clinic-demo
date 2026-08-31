"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, IndianRupee, LoaderCircle, Plus, ShieldCheck, Stethoscope, TriangleAlert, X } from "lucide-react";
import { apiJson, type ClinicService } from "@/types/clinic";

type ServiceInput = {
  code: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceRupees: number | null;
  bookingMode: "PUBLIC" | "STAFF_ONLY" | "REFERRAL";
  instructions: string;
};

export function ServicesView() {
  const client = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["services"], queryFn: () => apiJson<{ services: ClinicService[] }>("/api/services") });
  const create = useMutation({
    mutationFn: (input: ServiceInput) => apiJson<{ service: { name: string } }>("/api/services", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    }),
    onSuccess: async (result) => {
      setNotice(`${result.service.name} was added to the clinic catalogue.`);
      setAdding(false);
      await client.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const price = String(form.get("priceRupees") ?? "").trim();
    create.mutate({
      code: String(form.get("code") ?? ""), name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""), durationMinutes: Number(form.get("durationMinutes")),
      bufferMinutes: Number(form.get("bufferMinutes")), priceRupees: price ? Number(price) : null,
      bookingMode: String(form.get("bookingMode")) as ServiceInput["bookingMode"],
      instructions: String(form.get("instructions") ?? ""),
    });
  };

  return <div className="page-stack">
    <section className="page-heading"><div><p>Clinic catalogue</p><h2>Services</h2><span>Duration, booking access and preparation instructions in one place.</span></div><button className="primary-button" type="button" onClick={() => { create.reset(); setAdding(true); }}><Plus />Add service</button></section>
    {notice && <div className="success-banner"><Check /><span>{notice}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setNotice(null)}><X /></button></div>}
    {query.isError && <div className="error-banner"><TriangleAlert />{query.error.message}</div>}
    <section className="service-grid">{query.data?.services.map((service) => <article className="panel service-card" key={service.id}><header><span><Stethoscope /></span><em className={service.bookingMode === "PUBLIC" ? "public" : "staff"}>{service.bookingMode === "PUBLIC" ? "Online" : "Staff only"}</em></header><h3>{service.name}</h3><p>{service.description}</p><div className="service-meta"><span><Clock3 />{service.durationMinutes} min + {service.bufferMinutes} min buffer</span><span><IndianRupee />{service.pricePaise == null ? "Price set at clinic" : `${(service.pricePaise / 100).toLocaleString("en-IN")}`}</span></div><footer><ShieldCheck /><span>{service.instructions ?? "No preparation note configured"}</span></footer></article>)}</section>

    {adding && <div className="modal-backdrop appointment-modal"><section className="management-dialog" role="dialog" aria-modal="true" aria-label="Add clinic service"><header><div><p className="eyebrow">CATALOGUE MANAGEMENT</p><h3>Add service</h3></div><button type="button" aria-label="Close service form" onClick={() => setAdding(false)}><X /></button></header><form className="management-form" onSubmit={submit}>
      <label><span>Service code</span><input name="code" required minLength={2} maxLength={24} placeholder="DERMA" /></label>
      <label><span>Service name</span><input name="name" required minLength={2} maxLength={120} placeholder="Dermatology consultation" /></label>
      <label className="full"><span>Description</span><textarea name="description" rows={3} placeholder="What this appointment covers" /></label>
      <label><span>Duration (minutes)</span><input name="durationMinutes" type="number" min={5} max={480} defaultValue={20} required /></label>
      <label><span>Turnover buffer</span><input name="bufferMinutes" type="number" min={0} max={120} defaultValue={5} required /></label>
      <label><span>Price (₹)</span><input name="priceRupees" type="number" min={0} step="0.01" placeholder="600" /></label>
      <label><span>Booking access</span><select name="bookingMode" defaultValue="PUBLIC"><option value="PUBLIC">Public online</option><option value="STAFF_ONLY">Staff only</option><option value="REFERRAL">Referral</option></select></label>
      <label className="full"><span>Patient preparation instructions</span><textarea name="instructions" rows={3} placeholder="Optional preparation note" /></label>
      {create.isError && <div className="inline-error full"><TriangleAlert />{create.error.message}</div>}
      <footer className="full"><button type="button" className="secondary-button" onClick={() => setAdding(false)}>Cancel</button><button type="submit" className="primary-button" disabled={create.isPending}>{create.isPending ? <LoaderCircle className="spin" /> : <Check />}Save service</button></footer>
    </form></section></div>}
  </div>;
}
