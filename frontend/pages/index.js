import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BarChart,
  Calendar,
  Zap,
  Users,
  MessageSquare,
  Shield,
  Menu,
  X,
  Check,
  ArrowRight,
  Clock,
  Target,
} from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [position, setPosition] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || "You're on the list!");
        setIsSuccess(true);
        setPosition(data.position);
        setEmail('');
      } else {
        setMessage(data.error || 'Something went wrong');
        setIsSuccess(false);
      }
    } catch {
      setMessage('Network error. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI Content Generation',
      description:
        'Draft posts, captions, and threads tuned to your brand voice — with variations and quick refinements.',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Smart Scheduling',
      description:
        'Plan content on a calendar, drag to reschedule, and let automation remind you when it is time to publish.',
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: 'Performance Analytics',
      description:
        'Track what resonates: engagement signals and posting patterns in one place (expanding in roadmap).',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Faster Workflow',
      description:
        'From idea to scheduled post in minutes — built for solo creators and lean marketing teams.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Built for teams',
      description:
        'Roles, approvals, and shared libraries are on the roadmap for growing businesses.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Brand-safe defaults',
      description:
        'Tone controls and review steps help you stay on-message before anything goes live.',
    },
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '29',
      desc: 'Solo creators & side projects',
      features: [
        'AI generations per month',
        '1 calendar & scheduling',
        'Instagram, X, LinkedIn formats',
        'Email support',
      ],
      cta: 'Join waitlist',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '79',
      desc: 'Growing brands & small teams',
      features: [
        'Everything in Starter',
        'Higher generation limits',
        'Variations & refine workflows',
        'Priority onboarding',
      ],
      cta: 'Get early access',
      highlight: true,
    },
    {
      name: 'Business',
      price: '199',
      desc: 'Agencies & multi-brand',
      features: [
        'Everything in Pro',
        'Multiple workspaces (roadmap)',
        'SSO & audit (roadmap)',
        'Dedicated success manager',
      ],
      cta: 'Talk to us',
      highlight: false,
    },
  ];

  const faqs = [
    {
      question: 'How does AI generation work?',
      answer:
        'You choose platform, format, and topic. PostAssistant calls state-of-the-art models to produce ready-to-edit copy. You can request variations or short refinement instructions before scheduling.',
    },
    {
      question: 'Which platforms are supported?',
      answer:
        'Today we optimise copy for Instagram, X (Twitter), and LinkedIn. Direct publishing integrations roll out after the beta.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        'Waitlist members get early access and launch perks. Final trial terms are announced at launch — no credit card to join the list.',
    },
    {
      question: 'Can I use my own OpenAI key?',
      answer:
        'Self-hosted and BYOK options are under consideration for Business tier. Join the waitlist and tell us what you need.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center space-x-2 min-w-0">
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <span className="text-lg sm:text-2xl font-bold truncate">PostAssistant</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button type="button" onClick={() => scrollTo('features')} className="text-slate-600 hover:text-indigo-600 font-medium text-sm">
                Features
              </button>
              <button type="button" onClick={() => scrollTo('how-it-works')} className="text-slate-600 hover:text-indigo-600 font-medium text-sm">
                How it works
              </button>
              <button type="button" onClick={() => scrollTo('pricing')} className="text-slate-600 hover:text-indigo-600 font-medium text-sm">
                Pricing
              </button>
              <button type="button" onClick={() => scrollTo('faq')} className="text-slate-600 hover:text-indigo-600 font-medium text-sm">
                FAQ
              </button>
              <Link href="/login" className="text-slate-600 hover:text-indigo-600 font-medium text-sm">
                Log in
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('waitlist')}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
              >
                Join waitlist
              </button>
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-[min(100%,20rem)] bg-white shadow-xl p-5 flex flex-col gap-2 overflow-y-auto">
              <div className="flex justify-end mb-2">
                <button type="button" aria-label="Close" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <button type="button" className="text-left font-medium py-2 rounded-lg hover:bg-slate-50 px-2" onClick={() => scrollTo('features')}>
                Features
              </button>
              <button type="button" className="text-left font-medium py-2 rounded-lg hover:bg-slate-50 px-2" onClick={() => scrollTo('how-it-works')}>
                How it works
              </button>
              <button type="button" className="text-left font-medium py-2 rounded-lg hover:bg-slate-50 px-2" onClick={() => scrollTo('pricing')}>
                Pricing
              </button>
              <button type="button" className="text-left font-medium py-2 rounded-lg hover:bg-slate-50 px-2" onClick={() => scrollTo('faq')}>
                FAQ
              </button>
              <Link href="/login" className="font-medium py-2 px-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('waitlist')}
                className="mt-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold"
              >
                Join waitlist
              </button>
            </div>
          </div>
        )}
      </nav>

      <section className="border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="grid sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Clear value</p>
                <p className="text-sm text-slate-600">Less time writing. More time growing.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Ship on schedule</p>
                <p className="text-sm text-slate-600">Calendar + reminders for due posts.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">AI that adapts</p>
                <p className="text-sm text-slate-600">Variations and refinements in one flow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="container mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center scroll-mt-24">
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">Social content, upgraded</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Turn ideas into
          <span className="text-indigo-600 block">scheduled social posts</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          PostAssistant combines AI drafting, variations, and a scheduling calendar so creators and businesses stay consistent without burning out.
        </p>

        <div className="max-w-md mx-auto mb-14">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email for early access"
              className="flex-grow px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Joining…' : (
                <>
                  Join waitlist
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl text-sm ${
                isSuccess ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
              }`}
            >
              {message}
              {position != null && (
                <div className="mt-2">
                  Your position: <strong>#{position}</strong>
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-slate-500 text-sm">No spam. Unsubscribe anytime. We respect your inbox.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
          {[
            ['500+', 'Waitlist members'],
            ['10×', 'Faster first drafts'],
            ['24/7', 'Always-on assistant'],
            ['99%', 'Beta satisfaction goal'],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{n}</div>
              <div className="text-slate-600 text-sm">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-slate-50 py-16 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4">Everything in one workspace</h2>
          <p className="text-lg text-slate-600 text-center mb-14 max-w-2xl mx-auto">
            From blank page to scheduled post — designed for clarity and speed on desktop and mobile.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-14">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Describe the moment',
                body: 'Topic, tone, and format — tuned per network.',
              },
              {
                step: '2',
                title: 'Generate & shape',
                body: 'Get a strong first draft, try variations, refine with plain-language instructions.',
              },
              {
                step: '3',
                title: 'Schedule & ship',
                body: 'Drop it on the calendar. Automation nudges you when it is time to go live.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="bg-indigo-100 text-indigo-700 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-slate-50 py-16 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-4">Simple pricing</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-xl mx-auto">
            Early-access pricing. Lock in waitlist benefits before public launch.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-6 sm:p-8 flex flex-col ${
                  tier.highlight
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-[1.02]'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <h3 className={`text-lg font-bold ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>{tier.name}</h3>
                <p className={`text-sm mt-1 ${tier.highlight ? 'text-indigo-100' : 'text-slate-500'}`}>{tier.desc}</p>
                <div className="mt-6 mb-6">
                  <span className={`text-4xl font-bold ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>€{tier.price}</span>
                  <span className={tier.highlight ? 'text-indigo-200' : 'text-slate-500'}>/mo</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <Check className={`w-5 h-5 shrink-0 ${tier.highlight ? 'text-indigo-200' : 'text-indigo-600'}`} />
                      <span className={tier.highlight ? 'text-indigo-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => scrollTo('waitlist')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                    tier.highlight
                      ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to post with confidence?</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">
            Join the waitlist for launch updates, pricing, and early-access perks.
          </p>
          <button
            type="button"
            onClick={() => scrollTo('waitlist')}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition"
          >
            Reserve your spot
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-24 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">FAQ</h2>

          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
              <span className="text-xl font-bold">PostAssistant</span>
            </div>
            <div className="text-slate-400 text-center md:text-right text-sm">
              <p>© {new Date().getFullYear()} PostAssistant. All rights reserved.</p>
              <p className="mt-1">AI-assisted social content for modern teams.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
