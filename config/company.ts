const configuredBrandName = "{{BRAND_NAME}}";

export const company = {
  brandName: configuredBrandName,
  displayName: configuredBrandName.startsWith("{{") ? "AI Automation Hubballi" : configuredBrandName,
  legalName: "{{LEGAL_NAME}}",
  domain: "{{DOMAIN}}",
  email: "{{EMAIL}}",
  formEndpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "",
  phone: "{{PHONE}}",
  address: "{{ADDRESS}}",
  city: "Hubballi",
  state: "Karnataka",
  country: "India",
  postalCode: "{{POSTAL_CODE}}",
  tagline: "AI that works for your business.",
  description: "Practical AI employees and workflow automation for growing businesses.",
  languages: ["Kannada", "English", "Hindi"],
  socials: { linkedin: "{{LINKEDIN_URL}}", instagram: "{{INSTAGRAM_URL}}" },
} as const;
