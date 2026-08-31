import { ClinicShell } from "@/components/clinic/clinic-shell";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPublicDemoMode, requireStaff } from "@/server/clinic-context";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const publicDemo = isPublicDemoMode();
  if (process.env.NODE_ENV === "production" && !publicDemo) {
    const requestHeaders = await headers();
    const email = requestHeaders.get("oai-authenticated-user-email");
    if (!email) redirect("/login?reason=authentication");
    try {
      await requireStaff(new Request("https://twacha.internal/staff", { headers: { "oai-authenticated-user-email": email } }), "appointments.read");
    } catch {
      redirect("/login?reason=membership");
    }
  }
  return <ClinicShell demoMode={publicDemo}>{children}</ClinicShell>;
}
