"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleDashed, Mail, MessageCircle, MessagesSquare, TriangleAlert } from "lucide-react";
import { apiJson } from "@/types/clinic";

type Config = { providers: Array<{ channel: string; status: string }>; templates: Array<{ id: string; eventKey: string; channel: string; locale: string; bodyTemplate: string; active: boolean }> };

export function MessagesView() {
  const query = useQuery({ queryKey: ["clinic-config"], queryFn: () => apiJson<Config>("/api/config") });
  return <div className="page-stack"><section className="page-heading"><div><p>Communication engine</p><h2>Messages</h2><span>Provider-independent templates with explicit configuration status.</span></div></section>{query.isError && <div className="error-banner"><TriangleAlert />{query.error.message}</div>}<section className="provider-strip">{query.data?.providers.map((provider) => <article key={provider.channel}><span className={provider.status === "NOT_CONFIGURED" ? "off" : "on"}>{provider.channel === "WhatsApp" ? <MessageCircle /> : provider.channel === "Email" ? <Mail /> : <MessagesSquare />}</span><div><b>{provider.channel}</b><small>{provider.status.toLowerCase().replaceAll("_"," ")}</small></div>{provider.status === "NOT_CONFIGURED" ? <CircleDashed /> : <CircleCheck />}</article>)}</section><section className="panel template-list"><header><div><p className="eyebrow">REUSABLE TEMPLATES</p><h3>Clinic messages</h3></div><span>{query.data?.templates.length ?? 0} configured</span></header>{query.data?.templates.map((template) => <article key={template.id}><span className="channel-badge">{template.channel}</span><div><b>{template.eventKey.replaceAll("."," · ")}</b><p>{template.bodyTemplate}</p><small>{template.locale} · Variables are resolved at send time</small></div><span className="status status-confirmed">Active</span></article>)}</section><div className="configuration-notice"><TriangleAlert /><div><b>Development adapter only</b><p>No WhatsApp, SMS or email will be sent until a provider is configured with approved consent templates and webhook credentials.</p></div></div></div>;
}
