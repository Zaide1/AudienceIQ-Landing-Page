import { DocPage, DocSection, DocParagraph } from "../components/DocPage";

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "What this is",
    paragraphs: [
      "Audense is an early-stage product that helps founders explore who their audience might be. This page explains, in plain language, what data Audense collects when you use it and what we do with it.",
      "Audense is in beta. The product, the data we store, and this policy may evolve as we learn what founders need.",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: [
      "Account data: if you sign up, we store your email and a unique account id so you can log in and keep your work.",
      "Research inputs: the product description, audience goals, region, and other inputs you provide during onboarding and chat.",
      "Generated outputs: the audience map, segments, and chat history produced by Audense for your sessions.",
      "Usage data: basic technical information such as the pages you visit inside Audense and any errors the app encounters, used to keep the product working.",
    ],
  },
  {
    heading: "How we use it",
    paragraphs: [
      "To run the product: we use your inputs to generate your audience map, segments, and chat replies.",
      "To save your work: signed-in accounts can keep research history and switch between sessions.",
      "To improve the product: we may review aggregate, non-identifying patterns to make Audense more useful for founders.",
      "We do not sell your data, and we do not share your research inputs or outputs with third parties for advertising.",
    ],
  },
  {
    heading: "Guest sessions",
    paragraphs: [
      "If you use Audense without an account, your research is stored only in your browser. Clearing your browser data will remove it.",
      "When you create an account, Audense can migrate your active guest session into your account so you don't lose your work.",
    ],
  },
  {
    heading: "Third-party services",
    paragraphs: [
      "Audense uses standard infrastructure providers for hosting, authentication, and database storage. These providers process data on our behalf under their own security and privacy commitments.",
      "When live research is connected, Audense may query public discussion sources to surface signals relevant to your audience. It does not share your private inputs with those sources beyond what is necessary to perform the lookup.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can delete a research session from your dashboard at any time.",
      "You can sign out to clear local session data from this device.",
      "If you want your account and stored research deleted, contact us and we will remove it.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about this policy or your data? Reach out from the Help page in the dashboard. As a beta product, we read every message.",
    ],
  },
];

export default function Privacy() {
  const lastUpdated = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <DocPage
      title="Privacy Policy"
      subtitle="How Audense handles your data. Plain language, no surprises."
      lastUpdated={lastUpdated}
    >
      {SECTIONS.map((s) => (
        <DocSection key={s.heading} heading={s.heading}>
          {s.paragraphs.map((p, i) => (
            <DocParagraph key={i}>{p}</DocParagraph>
          ))}
        </DocSection>
      ))}
    </DocPage>
  );
}
