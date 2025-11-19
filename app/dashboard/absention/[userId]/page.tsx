'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { mockAbsentions, mockUsers } from '@/lib/mockData';
import { Absention } from '@/types';

export default function AbsentionPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const [absentions, setAbsentions] = useState<Absention[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }

    // Filter absentions for this user
    const userAbsentions = mockAbsentions.filter(a => a.userId === userId);
    setAbsentions(userAbsentions);

    // Get user name
    const user = mockUsers.find(u => u.id === userId);
    setUserName(user?.name || 'Unknown User');
  }, [userId, router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAbsentionBadgeColor = (absention: string) => {
    switch (absention) {
      case 'attend': return 'bg-green-100 text-green-800';
      case 'alpha': return 'bg-red-100 text-red-800';
      case 'permission': return 'bg-yellow-100 text-yellow-800';
      case 'sick': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Absention History</h1>
            <p className="text-gray-600 mt-1">User: {userName}</p>
          </div>

          {/* Absention Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absention Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {absentions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No absention records found for this user.
                    </td>
                  </tr>
                ) : (
                  absentions.map((absention, index) => (
                    <tr key={absention.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(absention.datetime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAbsentionBadgeColor(absention.absention)}`}>
                          {absention.absention}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {absentions.length} {absentions.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
