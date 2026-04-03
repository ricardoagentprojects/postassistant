import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DashboardSimple() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl mr-2">✨</span>
            <h1 className="text-2xl font-bold text-gray-900">PostAssistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name || user.email}!
            </h2>
            <p className="text-gray-600 mb-8">
              Your AI-powered content assistant is ready to help you create amazing social media content.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Posts Generated</h3>
                <p className="text-3xl font-bold text-blue-700">42</p>
                <p className="text-sm text-green-600 mt-2">+12% from last week</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Scheduled</h3>
                <p className="text-3xl font-bold text-green-700">18</p>
                <p className="text-sm text-green-600 mt-2">+5 this week</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Engagement</h3>
                <p className="text-3xl font-bold text-purple-700">4.8%</p>
                <p className="text-sm text-green-600 mt-2">+0.7%</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Time Saved</h3>
                <p className="text-3xl font-bold text-orange-700">32h</p>
                <p className="text-sm text-green-600 mt-2">This week</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex space-x-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Generate New Content
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  View Schedule
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Analytics Dashboard
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border-t pt-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Instagram post generated</p>
                    <p className="text-sm text-gray-600">"5 Tips for Restaurant Social Media"</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Twitter thread scheduled</p>
                    <p className="text-sm text-gray-600">AI content creation trends</p>
                  </div>
                  <span className="text-sm text-gray-500">Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}