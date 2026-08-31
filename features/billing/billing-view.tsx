"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  LoaderCircle,
  Printer,
  ReceiptIndianRupee,
  RefreshCw,
  Smartphone,
  TriangleAlert,
  WalletCards,
  X,
} from "lucide-react";
import { apiJson } from "@/types/clinic";

type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "VOID" | "REFUNDED";
type PaymentMethod = "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER";

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  paidPaise: number;
  balancePaise: number;
  issuedAt: number | null;
  createdAt: number;
  appointmentId: string | null;
  patientName: string;
  patientNumber: string;
  serviceName: string | null;
};

type ReadyEncounter = {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: number;
  suggestedPricePaise: number;
};

type BillingData = {
  invoices: Invoice[];
  readyToBill: ReadyEncounter[];
};

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "ONLINE", label: "Online" },
  { value: "OTHER", label: "Other" },
];

function money(paise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function dateTime(timestamp: number | null) {
  if (!timestamp) return "Not issued";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(timestamp);
}

function statusLabel(status: string) {
  return status.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function BillingView() {
  const queryClient = useQueryClient();
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [amountRupees, setAmountRupees] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [providerReference, setProviderReference] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["billing"],
    queryFn: () => apiJson<BillingData>("/api/billing"),
  });

  const issue = useMutation({
    mutationFn: (appointmentId: string) => apiJson<{
      invoiceId: string;
      invoiceNumber: string;
      status: InvoiceStatus;
      totalPaise: number;
      balancePaise: number;
    }>("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, action: "ISSUE" }),
    }),
    onSuccess: async (result) => {
      setNotice(`${result.invoiceNumber} was issued for ${money(result.totalPaise)}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["billing"] }),
        queryClient.invalidateQueries({ queryKey: ["consultations"] }),
      ]);
    },
  });

  const recordPayment = useMutation({
    mutationFn: ({ invoiceId, amountPaise }: { invoiceId: string; amountPaise: number }) => apiJson<{
      paymentId: string;
      invoiceId: string;
      status: InvoiceStatus;
      paidPaise: number;
      balancePaise: number;
    }>(`/api/billing/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise, method, providerReference, note }),
    }),
    onSuccess: async (result) => {
      setNotice(`Payment recorded. Remaining balance: ${money(result.balancePaise)}.`);
      setPaymentInvoiceId(null);
      setAmountRupees("");
      setProviderReference("");
      setNote("");
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });

  const invoices = query.data?.invoices ?? [];
  const readyToBill = query.data?.readyToBill ?? [];
  const selectedInvoice = invoices.find((invoice) => invoice.id === paymentInvoiceId) ?? null;
  const totals = {
    outstanding: invoices.reduce((sum, invoice) => sum + (invoice.status === "VOID" ? 0 : invoice.balancePaise), 0),
    paid: invoices.reduce((sum, invoice) => sum + invoice.paidPaise, 0),
  };

  const openPayment = (invoice: Invoice) => {
    setPaymentInvoiceId(invoice.id);
    setAmountRupees((invoice.balancePaise / 100).toFixed(2));
    setMethod("CASH");
    setProviderReference("");
    setNote("");
    setFormError(null);
    recordPayment.reset();
  };

  const confirmIssue = (encounter: ReadyEncounter) => {
    const message = `Issue an invoice for ${encounter.patientName} for ${money(encounter.suggestedPricePaise)}? Review the service and amount before continuing.`;
    if (window.confirm(message)) issue.mutate(encounter.appointmentId);
  };

  const submitPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedInvoice) return;
    const numericAmount = Number(amountRupees);
    const amountPaise = Math.round(numericAmount * 100);
    if (!Number.isFinite(numericAmount) || amountPaise <= 0) {
      setFormError("Enter a payment amount greater than zero.");
      return;
    }
    if (amountPaise > selectedInvoice.balancePaise) {
      setFormError(`Payment cannot exceed the ${money(selectedInvoice.balancePaise, selectedInvoice.currency)} balance.`);
      return;
    }
    setFormError(null);
    const confirmed = window.confirm(
      `Confirm ${statusLabel(method)} payment of ${money(amountPaise, selectedInvoice.currency)} against ${selectedInvoice.invoiceNumber}? This will update the invoice balance and audit log.`,
    );
    if (confirmed) recordPayment.mutate({ invoiceId: selectedInvoice.id, amountPaise });
  };

  if (query.isLoading) {
    return <div className="page-stack billing-page">
      <section className="page-heading"><div><p>Revenue operations</p><h2>Billing</h2><span>Loading the billing register and completed encounters…</span></div></section>
      <section className="billing-summary-grid" aria-label="Loading billing summary">{Array.from({ length: 4 }, (_, index) => <div className="skeleton billing-summary-skeleton" key={index} />)}</section>
      <div className="skeleton panel-skeleton" />
    </div>;
  }

  if (query.isError) {
    return <section className="error-state"><TriangleAlert /><h2>Billing could not load</h2><p>{query.error.message}</p><button type="button" onClick={() => query.refetch()}><RefreshCw />Try again</button></section>;
  }

  return <div className="page-stack billing-page">
    <section className="page-heading">
      <div><p>Revenue operations</p><h2>Billing</h2><span>Issue encounter-linked invoices and record confirmed payments with an audit trail.</span></div>
      <button className="secondary-button billing-print-button" type="button" onClick={() => window.print()}><Printer />Print register</button>
    </section>

    {notice && <div className="success-banner billing-no-print" role="status"><CheckCircle2 /><span>{notice}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setNotice(null)}><X /></button></div>}
    {issue.isError && <div className="error-banner billing-no-print" role="alert"><TriangleAlert /><span>{issue.error.message}</span><button type="button" aria-label="Dismiss invoice error" onClick={() => issue.reset()}><X /></button></div>}

    <section className="billing-summary-grid" aria-label="Billing summary">
      <article><span className="billing-summary-icon amber"><FileCheck2 /></span><div><small>Ready to bill</small><b>{readyToBill.length}</b><span>Completed encounters</span></div></article>
      <article><span className="billing-summary-icon blue"><ReceiptIndianRupee /></span><div><small>Invoices</small><b>{invoices.length}</b><span>Latest register entries</span></div></article>
      <article><span className="billing-summary-icon green"><Banknote /></span><div><small>Recorded paid</small><b>{money(totals.paid)}</b><span>Across loaded invoices</span></div></article>
      <article><span className="billing-summary-icon red"><CircleDollarSign /></span><div><small>Outstanding</small><b>{money(totals.outstanding)}</b><span>Open invoice balance</span></div></article>
    </section>

    <section className="panel ready-to-bill billing-no-print">
      <header><div><p className="eyebrow">COMPLETED ENCOUNTERS</p><h3>Ready to bill</h3></div><span>{readyToBill.length} pending</span></header>
      {readyToBill.length ? <div className="ready-billing-list">{readyToBill.map((encounter) => <article key={encounter.appointmentId}>
        <span className="avatar">{encounter.patientName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
        <div><b>{encounter.patientName}</b><small>{encounter.patientNumber} · {dateTime(encounter.scheduledAt)}</small></div>
        <div><b>{encounter.serviceName}</b><small>Completed consultation</small></div>
        <strong>{money(encounter.suggestedPricePaise)}</strong>
        <button type="button" className="primary-button" disabled={issue.isPending} onClick={() => confirmIssue(encounter)}>{issue.isPending && issue.variables === encounter.appointmentId ? <LoaderCircle className="spin" /> : <ReceiptIndianRupee />}Issue invoice</button>
      </article>)}</div> : <div className="empty-state compact"><CheckCircle2 /><h3>No encounters waiting</h3><p>Completed consultations without an active invoice will appear here.</p></div>}
    </section>

    <section className={`billing-workspace ${selectedInvoice ? "payment-open" : ""}`}>
      <div className="panel invoice-register">
        <header><div><p className="eyebrow">INVOICE REGISTER</p><h3>Recent invoices</h3></div><span>{invoices.length} invoices</span></header>
        {invoices.length ? <div className="invoice-table">
          <div className="invoice-table-head"><span>Invoice</span><span>Patient and service</span><span>Total</span><span>Paid</span><span>Balance</span><span>Status</span><span /></div>
          {invoices.map((invoice) => <article key={invoice.id} className={selectedInvoice?.id === invoice.id ? "selected" : ""}>
            <div className="invoice-identity"><b>{invoice.invoiceNumber}</b><small>{dateTime(invoice.issuedAt ?? invoice.createdAt)}</small></div>
            <div className="invoice-patient"><b>{invoice.patientName}</b><small>{invoice.patientNumber} · {invoice.serviceName ?? "Clinic charge"}</small></div>
            <span data-label="Total">{money(invoice.totalPaise, invoice.currency)}</span>
            <span data-label="Paid">{money(invoice.paidPaise, invoice.currency)}</span>
            <strong data-label="Balance">{money(invoice.balancePaise, invoice.currency)}</strong>
            <span className={`status status-${invoice.status.toLowerCase()}`}>{statusLabel(invoice.status)}</span>
            <div className="invoice-actions">{["ISSUED", "PARTIALLY_PAID"].includes(invoice.status) && invoice.balancePaise > 0
              ? <button type="button" onClick={() => openPayment(invoice)}><WalletCards />Record payment</button>
              : <span><CheckCircle2 />{invoice.status === "PAID" ? "Settled" : "No payment action"}</span>}
            </div>
          </article>)}
        </div> : <div className="empty-state"><ReceiptIndianRupee /><h3>No invoices yet</h3><p>Issue an invoice from a completed encounter to begin the register.</p></div>}
      </div>

      {selectedInvoice && <aside className="panel billing-payment-panel billing-no-print" aria-label={`Record payment for ${selectedInvoice.invoiceNumber}`}>
        <header><div><p className="eyebrow">RECORD PAYMENT</p><h3>{selectedInvoice.invoiceNumber}</h3></div><button type="button" aria-label="Close payment panel" onClick={() => setPaymentInvoiceId(null)}><X /></button></header>
        <div className="payment-invoice-brief"><span><small>Patient</small><b>{selectedInvoice.patientName}</b></span><span><small>Outstanding</small><b>{money(selectedInvoice.balancePaise, selectedInvoice.currency)}</b></span></div>
        <form onSubmit={submitPayment}>
          <label><span>Amount received</span><div className="money-input"><span>₹</span><input type="number" inputMode="decimal" min="0.01" max={(selectedInvoice.balancePaise / 100).toFixed(2)} step="0.01" value={amountRupees} onChange={(event) => setAmountRupees(event.target.value)} required /></div></label>
          <fieldset><legend>Payment method</legend><div className="payment-method-grid">{paymentMethods.map((item) => <label key={item.value} className={method === item.value ? "selected" : ""}><input type="radio" name="payment-method" value={item.value} checked={method === item.value} onChange={() => setMethod(item.value)} /><span>{item.value === "CASH" ? <Banknote /> : item.value === "UPI" || item.value === "ONLINE" ? <Smartphone /> : item.value === "CARD" ? <CreditCard /> : <WalletCards />}{item.label}</span></label>)}</div></fieldset>
          <label><span>Transaction or receipt reference <small>Optional</small></span><input value={providerReference} maxLength={160} onChange={(event) => setProviderReference(event.target.value)} placeholder={method === "CASH" ? "Cash receipt or drawer reference" : "Provider transaction reference"} /></label>
          <label><span>Internal note <small>Optional</small></span><textarea rows={3} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder="Payment context for the audit trail" /></label>
          {(formError || recordPayment.isError) && <div className="inline-error" role="alert"><TriangleAlert />{formError ?? recordPayment.error?.message}</div>}
          <p className="payment-confirmation-note"><FileCheck2 />You will confirm the amount and method before the payment is recorded.</p>
          <button className="primary-button" type="submit" disabled={recordPayment.isPending}>{recordPayment.isPending ? <LoaderCircle className="spin" /> : <WalletCards />}Review and record payment</button>
        </form>
      </aside>}
    </section>
  </div>;
}
