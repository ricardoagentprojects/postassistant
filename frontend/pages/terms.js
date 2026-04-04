import Head from 'next/head';
import LegalShell from '../components/LegalShell';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — PostAssistant</title>
        <meta name="description" content="Terms of Service for PostAssistant" />
      </Head>
      <LegalShell title="Terms of Service">
        <p className="text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs">
          This is a standard template for an early-stage product. It is not legal advice. Have a qualified
          lawyer review before relying on it for regulated or high-risk use.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Agreement</h2>
          <p>
            By accessing or using PostAssistant (&quot;Service&quot;), operated by PostAssistant (&quot;we&quot;,
            &quot;us&quot;), you agree to these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. The Service</h2>
          <p>
            PostAssistant provides tools to help you draft, organise, and schedule social media-related content
            using software and, where enabled, third-party AI providers. Features may change during beta or early
            access. We do not guarantee uninterrupted availability or that outputs will meet any particular
            standard or legal requirement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Accounts</h2>
          <p>
            You are responsible for safeguarding your account credentials and for activity under your account. You
            must provide accurate registration information. We may suspend or terminate accounts that violate these
            terms or harm the Service or other users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the Service for unlawful, harmful, deceptive, or discriminatory purposes.</li>
            <li>Attempt to gain unauthorised access to systems, data, or other users&apos; accounts.</li>
            <li>Reverse engineer or scrape the Service except as allowed by applicable law.</li>
            <li>Upload or generate content that infringes others&apos; intellectual property or privacy rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. AI-generated content</h2>
          <p>
            Outputs may be inaccurate or inappropriate. You are responsible for reviewing content before publication
            and for compliance with platform rules, advertising law, and your own brand guidelines. We are not liable
            for decisions you make based on generated text.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Intellectual property</h2>
          <p>
            We retain rights in the Service, branding, and software. Subject to your compliance with these terms,
            you may use outputs you lawfully generate for your business purposes as permitted by your subscription.
            Do not remove proprietary notices where required.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Subscriptions and fees</h2>
          <p>
            Paid plans, if offered, will be described at checkout. Fees are non-refundable except where required by
            law. We may change pricing with reasonable notice where contractually allowed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Disclaimer</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind, express or implied, including
            merchantability or fitness for a particular purpose. Some jurisdictions do not allow certain disclaimers;
            in those cases our liability is limited to the maximum extent permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, we are not liable for indirect, incidental, special,
            consequential, or punitive damages, or loss of profits, data, or goodwill, arising from your use of the
            Service. Our aggregate liability for claims relating to the Service is limited to the greater of (a) amounts
            you paid us in the twelve months before the claim or (b) one hundred euros (€100), except where liability
            cannot be limited by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Changes</h2>
          <p>
            We may update these terms. We will post the new version on this page and update the &quot;Last
            updated&quot; date. Continued use after changes constitutes acceptance where permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">11. Contact</h2>
          <p>
            Questions about these terms:{' '}
            <a href="mailto:ricardo.agent.projects@gmail.com" className="text-indigo-600 font-medium hover:underline">
              ricardo.agent.projects@gmail.com
            </a>
            .
          </p>
        </section>
      </LegalShell>
    </>
  );
}
