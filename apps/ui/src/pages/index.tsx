import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingBirthdays: 0,
    recentBlasts: 0,
    whatsappStatus: 'Unknown'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = await getApiUrl();
      
      const [membersRes, birthdaysRes] = await Promise.all([
        fetch(`${apiUrl}/blast/members`),
        fetch(`${apiUrl}/blast/birthdays/upcoming`)
      ]);

      const members = await membersRes.json();
      const birthdays = await birthdaysRes.json();

      setStats({
        totalMembers: members.length,
        upcomingBirthdays: birthdays.length,
        recentBlasts: 0,
        whatsappStatus: 'Connected'
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getApiUrl = async (): Promise<string> => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      return await (window as any).electron.getApiUrl();
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to Ministry Messenger - Your church communication platform
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Members
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.totalMembers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🎂</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Upcoming Birthdays
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.upcomingBirthdays}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📨</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Recent Blasts
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.recentBlasts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">💬</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      WhatsApp Status
                    </dt>
                    <dd className="text-lg font-semibold text-green-600">
                      {stats.whatsappStatus}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/upload"
                className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📤</span>
                  <div>
                    <p className="font-medium text-blue-900">Upload Contacts</p>
                    <p className="text-sm text-blue-700">
                      Import contacts from Excel, CSV or Google Sheets
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/compose"
                className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✍️</span>
                  <div>
                    <p className="font-medium text-green-900">Send Blast Message</p>
                    <p className="text-sm text-green-700">
                      Create and send WhatsApp or SMS campaigns
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/members"
                className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="font-medium text-purple-900">Manage Members</p>
                    <p className="text-sm text-purple-700">
                      View and manage church members database
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="text-gray-500 text-center py-8">
              <p>No recent activity</p>
              <p className="text-sm mt-2">
                Start by uploading contacts and sending your first blast!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Getting Started
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Upload your church contacts via Excel, CSV, or Google Sheets</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Review and edit contacts to ensure accuracy</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Compose your message with personalization</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>Send via WhatsApp or SMS and track delivery</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5.</span>
              <span>Successful recipients automatically become members</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}