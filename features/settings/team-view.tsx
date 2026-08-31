"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, KeyRound, LoaderCircle, Plus, ShieldCheck, Stethoscope, TriangleAlert, UserRoundCog, X } from "lucide-react";
import { apiJson } from "@/types/clinic";

type Config = { team: Array<{ id: string; displayName: string; email: string; title: string; isProvider: boolean; status: string; lastLoginAt: number | null }> };
type InviteInput = { displayName: string; email: string; title: string; role: "Doctor" | "Receptionist" };

export function TeamView() {
  const client = useQueryClient();
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["clinic-config"], queryFn: () => apiJson<Config>("/api/config") });
  const invite = useMutation({
    mutationFn: (input: InviteInput) => apiJson<{ member: { displayName: string; email: string } }>("/api/team", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    }),
    onSuccess: async (result) => {
      setNotice(`${result.member.displayName} was added as invited staff. Activate the verified identity before granting live access.`);
      setInviting(false);
      await client.invalidateQueries({ queryKey: ["clinic-config"] });
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const role = String(form.get("role")) as InviteInput["role"];
    invite.mutate({
      displayName: String(form.get("displayName") ?? ""), email: String(form.get("email") ?? ""),
      title: String(form.get("title") ?? ""), role,
    });
  };

  return <div className="page-stack">
    <section className="page-heading"><div><p>Access control</p><h2>Team</h2><span>Create role-bound invitations, then activate only verified staff identities.</span></div><button className="primary-button" type="button" onClick={() => { invite.reset(); setInviting(true); }}><Plus />Invite staff</button></section>
    {notice && <div className="success-banner"><Check /><span>{notice}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setNotice(null)}><X /></button></div>}
    {query.isError && <div className="error-banner"><TriangleAlert />{query.error.message}</div>}
    <section className="panel team-table"><header><span>Staff member</span><span>Role</span><span>Access</span><span>Status</span></header>{query.data?.team.map((member) => <article key={member.id}><span className="team-person"><i>{member.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i><span><b>{member.displayName}</b><small>{member.email}</small></span></span><span className="role-cell">{member.isProvider ? <Stethoscope /> : <UserRoundCog />}{member.title}</span><span><KeyRound />Tenant + assigned care</span><span className={`status status-${member.status === "ACTIVE" ? "confirmed" : "scheduled"}`}>{member.status}</span></article>)}</section>
    <section className="rbac-note"><ShieldCheck /><div><b>Least-privilege activation</b><p>Invitation creates the role assignment but does not bypass verified sign-in. Only activated identities can enter the live clinic workspace.</p></div></section>

    {inviting && <div className="modal-backdrop appointment-modal"><section className="management-dialog" role="dialog" aria-modal="true" aria-label="Invite clinic staff"><header><div><p className="eyebrow">ROLE-BOUND INVITATION</p><h3>Invite staff</h3></div><button type="button" aria-label="Close invitation" onClick={() => setInviting(false)}><X /></button></header><form className="management-form" onSubmit={submit}>
      <label><span>Full name</span><input name="displayName" required minLength={2} maxLength={120} placeholder="Staff member name" /></label>
      <label><span>Work email</span><input name="email" type="email" required maxLength={254} placeholder="name@clinic.in" /></label>
      <label><span>Job title</span><input name="title" required minLength={2} maxLength={120} placeholder="Dermatologist" /></label>
      <label><span>Clinic role</span><select name="role" defaultValue="Receptionist"><option>Receptionist</option><option>Doctor</option></select></label>
      <div className="configuration-notice full"><ShieldCheck /><div><b>No silent access</b><p>The account remains invited until its authenticated email is explicitly activated.</p></div></div>
      {invite.isError && <div className="inline-error full"><TriangleAlert />{invite.error.message}</div>}
      <footer className="full"><button type="button" className="secondary-button" onClick={() => setInviting(false)}>Cancel</button><button type="submit" className="primary-button" disabled={invite.isPending}>{invite.isPending ? <LoaderCircle className="spin" /> : <Plus />}Create invitation</button></footer>
    </form></section></div>}
  </div>;
}
