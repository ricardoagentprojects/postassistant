import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      router.push('/login');
      return;
    }
    
    // Simulate API call to get user data
    setTimeout(() => {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }, 500);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  const stats = [
    { label: 'Posts Generated', value: '42', change: '+12%', color: 'blue' },
    { label: 'Scheduled', value: '18', change: '+5', color: 'green' },
    { label: 'Avg. Engagement', value: '4.8%', change: '+0.7%', color: 'purple' },
    { label: 'Time Saved', value: '32h', change: 'This week', color: 'orange' },
  ];

  const recentContent = [
    { platform: 'Instagram', text: 'Boost your restaurant sales with these 5 social media tips...', date: '2 hours ago' },
    { platform: 'Twitter', text: 'AI-powered content creation is changing how small businesses market...', date: 'Yesterday' },
    { platform: 'LinkedIn', text: 'How to build a consistent brand voice across all social channels', date: '2 days ago' },
  ];

  const upcomingPosts = [
    { time: 'Today, 15:00', platform: 'Instagram', type: 'Carousel' },
    { time: 'Tomorrow, 09:00', platform: 'Twitter', type: 'Thread' },
    { time: 'Apr 5, 12:00', platform: 'LinkedIn', type: 'Article' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl text-blue-600 font-bold">✨</span>
                <span className="ml-2 text-xl font-bold text-gray-900">PostAssistant</span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <a href="#" className="text-gray-900 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">Dashboard</a>
                <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Content</a>
                <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Schedule</a>
                <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Analytics</a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                    <p className="text-xs text-gray-500">Premium Plan</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
          <p className="mt-2 text-gray-600">Here's what's happening with your content today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-700',
              green: 'bg-green-50 text-green-700',
              purple: 'bg-purple-50 text-purple-700',
              orange: 'bg-orange-50 text-orange-700',
            };
            return (
              <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[stat.color]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                        <dd>
                          <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-green-600">{stat.change}</span> from last week
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Content</h3>
                <p className="mt-1 text-sm text-gray-500">Your latest AI-generated posts</p>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-6">
                  {recentContent.map((content, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-100 text-blue-800 font-semibold">
                          {content.platform.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{content.platform}</h4>
                          <span className="text-xs text-gray-500">{content.date}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{content.text}</p>
                        <div className="mt-2 flex space-x-3">
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                          <button className="text-xs text-green-600 hover:text-green-800 font-medium">Schedule</button>
                          <button className="text-xs text-gray-600 hover:text-gray-800 font-medium">Copy</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate New Content
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Schedule</h3>
                <p className="mt-1 text-sm text-gray-500">Next posts to be published</p>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-5">
                  {upcomingPosts.map((post, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="flex-shrink-0">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{post.time}</p>
                        <p className="text-sm text-gray-500">{post.platform} • {post.type}</p>
                      </div>
                      <button className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium">View</button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    View Full Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">💡 Pro Tip</h3>
              <p className="text-sm text-gray-700 mb-4">
                Post consistently! Brands that publish 3+ times per week see 2.5x more engagement.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Learn more →
              </button>
            </div>