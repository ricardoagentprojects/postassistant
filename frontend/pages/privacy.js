import Head from 'next/head';
import Link from 'next/link';
import LegalShell from '../components/LegalShell';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — PostAssistant</title>
        <meta name="description" content="Privacy Policy for PostAssistant" />
      </Head>
      <LegalShell title="Privacy Policy">
        <p className="text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs">
          Template privacy notice for an early-stage product. Not legal advice. Adapt for your entity, hosting
          locations, and GDPR/other obligations with professional counsel.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Who we are</h2>
          <p>
            PostAssistant (&quot;we&quot;) operates the website and application at the domains we publish. For data
            protection enquiries, contact{' '}
            <a href="mailto:ricardo.agent.projects@gmail.com" className="text-indigo-600 font-medium hover:underline">
              ricardo.agent.projects@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Data we collect</h2>
          <p>We may collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Account data:</strong> name, email, company, role, and credentials (passwords stored hashed).
            </li>
            <li>
              <strong>Content you create:</strong> topics, generated text, scheduling metadata, and related settings.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device identifiers, and logs needed for
              security and operations.
            </li>
            <li>
              <strong>Waitlist:</strong> email and optional details you submit on the marketing site.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. How we use data</h2>
          <p>We use personal data to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, maintain, and improve the Service.</li>
            <li>Authenticate users and send transactional messages (e.g. password reset).</li>
            <li>Process waitlist and product communications you opt into.</li>
            <li>Comply with law and protect rights, safety, and security.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. AI and third parties</h2>
          <p>
            When you use AI features, portions of your prompts may be sent to model providers (e.g. OpenAI) under
            their terms and privacy policies. We configure services to minimise unnecessary data transfer. Hosting,
            email (SMTP), and analytics may involve subprocessors in various regions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Legal bases (EEA/UK)</h2>
          <p>
            Where GDPR applies, we rely on performance of a contract, legitimate interests (e.g. security, product
            improvement), and consent where required (e.g. certain marketing cookies or emails).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Retention</h2>
          <p>
            We keep data while your account is active and for a reasonable period afterwards for backups, disputes,
            and legal obligations. Waitlist data is retained until you unsubscribe or we delete the list as described
            in communications.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Your rights</h2>
          <p>
            Depending on your location, you may have rights to access, rectify, erase, restrict, or object to
            processing, and to data portability. You may withdraw consent where processing is consent-based. To
            exercise rights, email us at the address above. You may lodge a complaint with your supervisory authority.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Security</h2>
          <p>
            We implement appropriate technical and organisational measures. No method of transmission over the
            Internet is 100% secure; we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Children</h2>
          <p>The Service is not directed at children under 16 (or the minimum age in your jurisdiction).</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">10. International transfers</h2>
          <p>
            If we transfer data outside your country, we use appropriate safeguards such as standard contractual
            clauses where required.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">11. Changes</h2>
          <p>
            We may update this policy. We will post changes here and update the date above. Material changes may
            require additional notice where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">12. Related</h2>
          <p>
            See also our{' '}
            <Link href="/terms" className="text-indigo-600 font-medium hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </LegalShell>
    </>
  );
}
