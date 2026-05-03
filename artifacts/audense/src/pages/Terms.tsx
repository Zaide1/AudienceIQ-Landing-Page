import { DocPage, DocSection, DocParagraph } from "../components/DocPage";

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Beta product",
    paragraphs: [
      "AudienceIQ is an early-stage beta product. Features, outputs, and pricing may change. By using AudienceIQ, you accept that the product is provided as-is and may be updated, paused, or removed at any time.",
    ],
  },
  {
    heading: "How to use AudienceIQ",
    paragraphs: [
      "You can use AudienceIQ to explore audiences and validation ideas for products you are building or considering.",
      "You agree not to use AudienceIQ for unlawful purposes, to harass others, to attempt to break the service, or to scrape or resell the outputs as your own market-research product.",
    ],
  },
  {
    heading: "Accounts",
    paragraphs: [
      "You can run a single research session as a guest. To save history, switch sessions, or run additional research, you'll need to create an account.",
      "You are responsible for keeping your sign-in details safe and for activity under your account.",
    ],
  },
  {
    heading: "What AudienceIQ outputs are (and aren't)",
    paragraphs: [
      "Audience numbers, segments, objections, and competitor angles produced by AudienceIQ are directional MVP estimates designed to help you decide where to validate first.",
      "They are not official market sizing, financial advice, legal advice, or guaranteed outcomes. You should validate any decision with real users before investing time or money.",
      "When live research is connected, AudienceIQ may surface public discussion signals to support your map. Those signals come from third-party sources and may be incomplete or biased.",
    ],
  },
  {
    heading: "Your content",
    paragraphs: [
      "You retain ownership of the inputs you provide and of the outputs AudienceIQ generates for your sessions. AudienceIQ receives a limited licence to process them for the purpose of running the product.",
      "Don't put confidential third-party material, personal data of others, or anything you don't have the right to share into AudienceIQ.",
    ],
  },
  {
    heading: "No warranty",
    paragraphs: [
      "AudienceIQ is provided without warranties of any kind. We don't guarantee that the service will be available, accurate, or fit for a particular purpose.",
      "To the extent permitted by law, AudienceIQ and its operators are not liable for indirect or consequential losses arising from your use of the product.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "We may update these terms as the product evolves. Continued use after changes means you accept the updated terms.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about these terms? Reach out from the Help page in the dashboard.",
    ],
  },
];

export default function Terms() {
  const lastUpdated = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <DocPage
      title="Terms of Service"
      subtitle="The honest agreement for using AudienceIQ while it's in beta."
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
