const configuredBrandName = "AI Automation Hubballi";

export const company = {
  brandName: configuredBrandName,
  displayName: configuredBrandName.startsWith("{{") ? "AI Automation Hubballi" : configuredBrandName,
  legalName: "AI Automation Hubballi",
  domain: "https://rooohi.github.io/hbl-001-supreme-clinic-demo",
  email: "",
  formEndpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "",
  phone: "",
  address: "Hubballi, Karnataka",
  city: "Hubballi",
  state: "Karnataka",
  country: "India",
  postalCode: "",
  tagline: "Turn customer requests into finished work.",
  description: "Practical AI roles and connected workflow automation for growing organisations.",
  languages: ["ಕನ್ನಡ", "English", "Hindi"],
  socials: { linkedin: "", instagram: "" },
} as const;
