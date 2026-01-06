import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function Reports() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/blast/jobs`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApiUrl = async (): Promise<string> => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      return await (window as any).electron.getApiUrl();
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Blast Reports</h1>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No blast jobs yet</p>
            <a
              href="/upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Blast
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => {
              const successCount = job.results.filter((r: any) => r.status === 'success').length;
              const failedCount = job.results.filter((r: any) => r.status === 'failed').length;
              const successRate = ((successCount / job.total) * 100).toFixed(1);

              return (
                <div key={job.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {new Date(job.createdAt).toLocaleString()}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {job.channel} • {job.status}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'running'
                        ? 'bg-blue-100 text-blue-800'
                        : job.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold">{job.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-600">Success</p>
                      <p className="text-2xl font-bold text-green-700">{successCount}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-600">Failed</p>
                      <p className="text-2xl font-bold text-red-700">{failedCount}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-600">Success Rate</p>
                      <p className="text-2xl font-bold text-blue-700">{successRate}%</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Message:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {job.message.substring(0, 150)}
                      {job.message.length > 150 && '...'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <a
                      href={`/queue?jobId=${job.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}