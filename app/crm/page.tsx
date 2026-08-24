import type { Metadata } from "next";
import { CrmWorkspace } from "@/components/crm-workspace";

export const metadata:Metadata={
  title:"Lead Workspace",
  description:"A device-local lead workspace for TORVENT.",
  robots:{index:false,follow:false},
};

export default function CrmPage(){return <CrmWorkspace/>;}
