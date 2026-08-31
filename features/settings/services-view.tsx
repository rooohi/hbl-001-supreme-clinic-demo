"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock3, IndianRupee, Plus, ShieldCheck, Stethoscope, TriangleAlert } from "lucide-react";
import { apiJson, type ClinicService } from "@/types/clinic";

export function ServicesView() {
  const query = useQuery({ queryKey: ["services"], queryFn: () => apiJson<{ services: ClinicService[] }>("/api/services") });
  return <div className="page-stack"><section className="page-heading"><div><p>Clinic catalogue</p><h2>Services</h2><span>Duration, booking access and preparation instructions in one place.</span></div><button className="primary-button" type="button" disabled title="Service editing is not enabled in this preview"><Plus />Add service</button></section>{query.isError && <div className="error-banner"><TriangleAlert />{query.error.message}</div>}<section className="service-grid">{query.data?.services.map((service) => <article className="panel service-card" key={service.id}><header><span><Stethoscope /></span><em className={service.bookingMode === "PUBLIC" ? "public" : "staff"}>{service.bookingMode === "PUBLIC" ? "Online" : "Staff only"}</em></header><h3>{service.name}</h3><p>{service.description}</p><div className="service-meta"><span><Clock3 />{service.durationMinutes} min + {service.bufferMinutes} min buffer</span><span><IndianRupee />{service.pricePaise == null ? "Price set at clinic" : `${(service.pricePaise/100).toLocaleString("en-IN")}`}</span></div><footer><ShieldCheck /><span>{service.instructions ?? "No preparation note configured"}</span></footer></article>)}</section></div>;
}
