import type { MetadataRoute } from "next";
import { company } from "@/config/company";
export const dynamic = "force-static";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/",disallow:"/hbl-001-supreme-clinic-demo/crm/"},sitemap:`${company.domain}/sitemap.xml`}}
