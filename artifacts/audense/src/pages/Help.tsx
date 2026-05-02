import {
  DocPage,
  DocSection,
  DocParagraph,
  DocBulletList,
  DocDefinition,
} from "../components/DocPage";

export default function Help() {
  return (
    <DocPage
      title="Help & guidance"
      subtitle="Everything you need to understand your audience map, the numbers behind it, live research, and how to validate what you find."
      backLabel="Back to dashboard"
      backTo="/dashboard"
    >
      <DocSection heading="Understanding your audience map">
        <DocParagraph>
          Your audience map is Audense's working view of who is most likely to
          care about what you're building. It combines what you described in
          onboarding with broad public signals to produce a directional picture
          of reachable people, priority segments, and where attention seems to
          cluster.
        </DocParagraph>
        <DocDefinition
          label="Audience Universe"
          body="Each dot represents a slice of your estimated reachable market. Coloured clusters show priority audience segments."
        />
        <DocDefinition
          label="Top Audience Segments"
          body="Your strongest audience groups ranked by fit, urgency, reachability, and likely response to your positioning."
        />
      </DocSection>

      <DocSection heading="What the numbers mean">
        <DocParagraph>
          The numbers Audense shows are directional audience estimates designed
          to help you choose where to test first. They are not official
          market-size statistics. Treat them as a starting point for your own
          validation, not a verified figure.
        </DocParagraph>
        <DocDefinition
          label="Reachable Audience"
          body="Directional estimate of people Audense thinks are reachable for this product, category, and region."
        />
        <DocDefinition
          label="Estimated Coverage"
          body="The share of your reachable audience your current positioning is likely to address first. This is an MVP estimate, not an official statistic."
        />
        <DocDefinition
          label="Untapped Opportunity"
          body="The remaining audience potential outside your current early focus. Calculated from reachable audience minus estimated coverage."
        />
        <DocDefinition
          label="Confidence"
          body="How reliable this map is based on onboarding detail, source quality, live research availability, and signal strength."
        />
      </DocSection>

      <DocSection heading="How to use the map">
        <DocParagraph>
          The map is most useful as a way to prioritise where to spend your
          first hours of validation. A few habits that tend to work well:
        </DocParagraph>
        <DocBulletList
          items={[
            "Start with the largest high-fit segment, not necessarily the biggest theoretical market.",
            "Use the chat to ask where to find a segment, what message to test, and what objections to expect.",
            "Use live research when you want supporting public signals for a hypothesis.",
            "Treat the first map as a starting hypothesis, then refine it as you learn.",
          ]}
        />
      </DocSection>

      <DocSection heading="Live research and evidence">
        <DocParagraph>
          When live research is enabled, Audense can use connected public
          sources as supporting signals for your audience map. This is helpful
          when you want evidence-backed quotes, examples, or patterns to
          pressure-test a segment.
        </DocParagraph>
        <DocParagraph>
          Source coverage may be limited and skewed depending on the product
          category, so live research should be read alongside your own
          conversations with real users — not in place of them.
        </DocParagraph>
      </DocSection>

      <DocSection heading="Saving research and history">
        <DocParagraph>
          Each new research creates its own session with its own audience map
          and chat. Previous sessions stay intact in your history, and you can
          switch between them at any time from the dashboard.
        </DocParagraph>
        <DocParagraph>
          You can run a single research session as a guest to try Audense. To
          save history, switch between sessions, or start additional research,
          create a free account — your active guest session can be migrated
          into your account so nothing is lost.
        </DocParagraph>
      </DocSection>
    </DocPage>
  );
}
