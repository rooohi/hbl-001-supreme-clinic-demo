import type { MetadataRoute } from "next";
import { company } from "@/config/company";
export const dynamic = "force-static";
const routes=["","ai-agents","ai-voice-agents","whatsapp-ai-automation","business-process-automation","custom-ai-development","ai-employees/sales-agent","ai-employees/receptionist","ai-employees/admission-officer","ai-employees/support-agent","industries/education","industries/healthcare","industries/real-estate","industries/manufacturing","industries/service-businesses","locations/hubli","about","case-studies","insights","contact","privacy","terms","cookies"];
export default function sitemap():MetadataRoute.Sitemap{return routes.map(route=>({url:`${company.domain}/${route}`,lastModified:new Date(),changeFrequency:route===""?"weekly":"monthly",priority:route===""?1:.7}))}
