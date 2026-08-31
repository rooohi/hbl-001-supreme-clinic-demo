"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, Phone, UserRound, X } from "lucide-react";
import { apiJson, type ClinicService } from "@/types/clinic";

const formSchema = z.object({
  serviceId: z.string().uuid("Choose a service"),
  type: z.enum(["NEW_CONSULTATION", "FOLLOW_UP", "REPORT_REVIEW", "PROCEDURE", "LASER_SESSION", "COSMETOLOGY", "CUSTOM"]),
  date: z.string().min(1, "Choose a date"),
  time: z.string().min(1, "Choose an available time"),
  patientName: z.string().trim().min(2, "Enter the patient’s name").max(100),
  phone: z.string().trim().regex(/^(\+91[6-9]\d{9}|[6-9]\d{9})$/, "Enter a valid Indian mobile number"),
  reason: z.string().trim().max(300).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type AppointmentInitialValues = Partial<Pick<FormValues, "serviceId" | "type" | "patientName" | "phone" | "reason">>;
type Availability = { slots: Array<{ time: string; scheduledAt: number }>; label: string; closed: boolean };

function todayInIndia() {
  const today = new Date();
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(today);
}

export function AppointmentForm({ publicMode = false, initialValues, onClose, onCreated }: { publicMode?: boolean; initialValues?: AppointmentInitialValues; onClose?: () => void; onCreated: (result: { id: string; scheduledAt: number; serviceName?: string; trackingToken?: string; trackingExpiresAt?: number }) => void }) {
  const { data: serviceData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", publicMode ? "public" : "staff"],
    queryFn: () => apiJson<{ services: ClinicService[] }>(`/api/services?audience=${publicMode ? "public" : "staff"}`),
  });
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceId: initialValues?.serviceId ?? "",
      type: initialValues?.type ?? "NEW_CONSULTATION",
      date: todayInIndia(),
      time: "",
      patientName: initialValues?.patientName ?? "",
      phone: initialValues?.phone ?? "",
      reason: initialValues?.reason ?? "",
    },
  });
  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const date = useWatch({ control: form.control, name: "date" });
  const time = useWatch({ control: form.control, name: "time" });
  const availability = useQuery({
    queryKey: ["availability", publicMode ? "public" : "staff", serviceId, date],
    queryFn: () => apiJson<Availability>(`/api/public/availability?audience=${publicMode ? "public" : "staff"}&serviceId=${encodeURIComponent(serviceId)}&date=${date}`),
    enabled: Boolean(serviceId && date),
  });
  const selectedService = useMemo(() => serviceData?.services.find((service) => service.id === serviceId), [serviceData, serviceId]);

  useEffect(() => { form.setValue("time", ""); }, [date, serviceId, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => apiJson<{ appointment: { id: string; scheduledAt: number; serviceName?: string; trackingToken?: string; trackingExpiresAt?: number } }>(publicMode ? "/api/public/bookings" : "/api/appointments", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ ...values, consent: publicMode }),
    }),
    onSuccess: (result) => onCreated(result.appointment),
  });

  return <form className={`appointment-form ${publicMode ? "public" : ""}`} onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
    {!publicMode && <header><div><span className="form-icon"><CalendarDays /></span><div><p>New appointment</p><h2>Add to Dr. Suman’s schedule</h2></div></div>{onClose && <button type="button" onClick={onClose} aria-label="Close"><X /></button>}</header>}
    <div className="form-body">
      <section className="form-section"><div className="form-section-title"><span>1</span><div><b>Visit details</b><small>Service and appointment type</small></div></div>
        <label><span>Service</span><select {...form.register("serviceId")} disabled={servicesLoading}><option value="">{servicesLoading ? "Loading services…" : "Choose a service"}</option>{serviceData?.services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.durationMinutes} min</option>)}</select>{form.formState.errors.serviceId && <em role="alert">{form.formState.errors.serviceId.message}</em>}</label>
        <label><span>Appointment type</span><select {...form.register("type")}><option value="NEW_CONSULTATION">New consultation</option><option value="FOLLOW_UP">Follow-up</option><option value="REPORT_REVIEW">Report review</option><option value="PROCEDURE">Procedure</option><option value="LASER_SESSION">Laser session</option><option value="COSMETOLOGY">Cosmetology</option><option value="CUSTOM">Custom</option></select></label>
        {selectedService?.instructions && <div className="service-note"><CheckCircle2 /><span>{selectedService.instructions}</span></div>}
      </section>

      <section className="form-section"><div className="form-section-title"><span>2</span><div><b>Date and time</b><small>Only conflict-free slots are shown</small></div></div>
        <label><span>Date</span><div className="input-with-icon"><CalendarDays /><input type="date" min={todayInIndia()} {...form.register("date")} /></div>{form.formState.errors.date && <em role="alert">{form.formState.errors.date.message}</em>}</label>
        <div className="slot-field"><span>Available time</span>
          {availability.isFetching && <div className="slot-loading"><LoaderCircle className="spin" />Calculating availability…</div>}
          {availability.isError && <div className="inline-error">{availability.error.message}</div>}
          {availability.data?.closed && <div className="inline-empty">Clinic is closed on Sundays. Choose another date.</div>}
          {availability.data && !availability.data.closed && availability.data.slots.length === 0 && <div className="inline-empty">No online slots remain for this date.</div>}
          <div className="slot-grid">{availability.data?.slots.map((slot) => <button type="button" key={slot.scheduledAt} className={time === new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(slot.scheduledAt) ? "selected" : ""} onClick={() => form.setValue("time", new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(slot.scheduledAt), { shouldValidate: true })}><Clock3 />{slot.time}</button>)}</div>
          {availability.data?.label && <small className="calculation-label">{availability.data.label}</small>}
          {form.formState.errors.time && <em role="alert">{form.formState.errors.time.message}</em>}
        </div>
      </section>

      <section className="form-section"><div className="form-section-title"><span>3</span><div><b>Patient details</b><small>Used only for clinic operations</small></div></div>
        <label><span>Patient name</span><div className="input-with-icon"><UserRound /><input autoComplete="name" placeholder="Full name" {...form.register("patientName")} /></div>{form.formState.errors.patientName && <em role="alert">{form.formState.errors.patientName.message}</em>}</label>
        <label><span>Mobile number</span><div className="input-with-icon"><Phone /><input inputMode="tel" autoComplete="tel" placeholder="98765 43210" {...form.register("phone")} /></div>{form.formState.errors.phone && <em role="alert">{form.formState.errors.phone.message}</em>}</label>
        <label className="full"><span>Reason for visit <small>Optional</small></span><textarea rows={3} placeholder="A short note for the clinic" {...form.register("reason")} />{form.formState.errors.reason && <em role="alert">{form.formState.errors.reason.message}</em>}</label>
      </section>
      {publicMode && <p className="consent-copy">By confirming, you consent to Twacha Clinic using these details to manage this appointment and related care communications. You can request correction or deletion subject to applicable retention duties.</p>}
      {mutation.isError && <div className="form-error" role="alert">{mutation.error.message}</div>}
    </div>
    <footer>{onClose && <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>}<button className="primary-button submit-button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><LoaderCircle className="spin" />Confirming…</> : publicMode ? "Confirm appointment" : "Create appointment"}</button></footer>
  </form>;
}
