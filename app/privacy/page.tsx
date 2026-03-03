// app/privacy/page.tsx
import type { Metadata } from "next";
import PrivacyPolicy from "./privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy | PartyDispo",
  description: "Privacy Policy di PartyDispo.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}