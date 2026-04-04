import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardApp from '../components/DashboardApp';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.replace('/login');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <DashboardApp user={user} onLogout={handleLogout} router={router} />;
}
