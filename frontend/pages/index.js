import { useState } from 'react';
import { CheckCircle, Sparkles, BarChart, Calendar, Zap, Users, MessageSquare, Shield } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [position, setPosition] = useState(null);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'You\'re on the list! 🎉');
        setIsSuccess(true);
        setPosition(data.position);
        setEmail(''); // Clear form
      } else {
        setMessage(data.error || 'Something went wrong');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setIsSuccess(false);
      console.error('Waitlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI Content Generation',
      description: 'Generate engaging posts, captions, and hashtags in seconds with GPT-4.'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Smart Scheduling',
      description: 'Schedule posts for optimal times across Instagram, Twitter, and LinkedIn.'
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: 'Performance Analytics',
      description: 'Track engagement, growth, and ROI with detailed analytics dashboards.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'One-Click Publishing',
      description: 'Publish directly to your social media accounts with a single click.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Audience Insights',
      description: 'Understand your audience with demographic and engagement data.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Brand Safety',
      description: 'AI-powered content moderation to protect your brand reputation.'
    }
  ];

  const faqs = [
    {
      question: 'How does the AI content generation work?',
      answer: 'Our AI analyzes your brand voice, target audience, and industry trends to create engaging, on-brand content that resonates with your followers.'
    },
    {
      question: 'Which social platforms do you support?',
      answer: 'Currently Instagram, Twitter, and LinkedIn. Facebook and TikTok support coming soon!'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All early access users get 30 days free when we launch. Join the waitlist to secure your spot.'
    },
    {
      question: 'How much does it cost?',
      answer: 'Plans start at $29/month for individuals and $99/month for businesses. Early access users get special pricing.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">PostAssistant</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600 font-medium">FAQ</a>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Join Waitlist
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          AI-Powered Social Media
          <span className="text-blue-600 block">Content Assistant</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Generate, schedule, and analyze social media content 10x faster with AI. 
          Perfect for creators, restaurants, and small businesses.
        </p>
        
        <div className="max-w-md mx-auto mb-16">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for early access"
              className="flex-grow px-6 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Waitlist →'}
            </button>
          </form>
          
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
              {position && <div className="mt-2 text-sm">Your position in line: <strong>#{position}</strong></div>}
            </div>
          )}
          
          <p className="mt-4 text-gray-500 text-sm">
            Join 500+ creators and businesses on the waitlist. No credit card required.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Waitlist Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">10x</div>
            <div className="text-gray-600">Faster Content Creation</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">24/7</div>
            <div className="text-gray-600">AI Assistant</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">99%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Everything You Need for Social Media Success
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            From content creation to analytics, we've got you covered.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How PostAssistant Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Describe Your Needs</h3>
              <p className="text-gray-600">Tell our AI about your brand, audience, and content goals.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Generates Content</h3>
              <p className="text-gray-600">Get engaging posts, captions, and hashtags tailored to your brand.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Schedule & Publish</h3>
              <p className="text-gray-600">Schedule posts for optimal times and publish with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join the waitlist today and get 30 days free when we launch.
          </p>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-grow px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Get Early Access →'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <MessageSquare className="w-8 h-8" />
              <span className="text-2xl font-bold">PostAssistant</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>© 2026 PostAssistant. All rights reserved.</p>
              <p className="mt-2">AI-powered social media content assistant.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}