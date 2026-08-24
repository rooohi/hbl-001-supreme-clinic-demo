const configuredBrandName = "TORVENT";

export const company = {
  brandName: configuredBrandName,
  displayName: configuredBrandName,
  legalName: "TORVENT",
  domain: "https://rooohi.github.io/hbl-001-supreme-clinic-demo",
  email: "",
  formEndpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "",
  phone: "+91 73532 60596",
  phoneE164: "+917353260596",
  whatsappNumber: "917353260596",
  businessHours: "Monday–Friday · 9:00 AM–5:00 PM IST",
  address: "Hubballi, Karnataka",
  city: "Hubballi",
  state: "Karnataka",
  country: "India",
  postalCode: "",
  founder: {
    name: "Rohit S Kale",
    role: "Founder · Product & AI Systems",
    bio: "Rohit S Kale is a multidisciplinary product builder from Nargund in Gadag district. With four years of professional and corporate experience across graphic design, UI/UX, product design and AI product development, he combines visual thinking with practical systems design to build useful AI experiences for growing teams.",
  },
  tagline: "Turn customer requests into finished work.",
  description: "Practical AI roles and connected workflow automation for growing organisations.",
  languages: ["ಕನ್ನಡ", "English", "Hindi"],
  socials: { linkedin: "", instagram: "" },
} as const;
