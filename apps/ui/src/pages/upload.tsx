import { useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

interface Contact {
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  [key: string]: any;
}

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'upload' | 'review' | 'processing'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
        setError('Please upload Excel (.xlsx, .xls) or CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/blast/parse-contacts`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to parse file');

      const data = await response.json();
      setContacts(data.contacts);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSheetImport = async () => {
    const sheetUrl = prompt('Enter Google Sheet URL:');
    if (!sheetUrl) return;

    setLoading(true);
    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/blast/import-from-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl })
      });

      if (!response.ok) throw new Error('Failed to import from Google Sheet');

      const data = await response.json();
      setContacts(data.contacts);
      setStep('review');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleEditContact = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleProceed = () => {
    localStorage.setItem('blast_contacts', JSON.stringify(contacts));
    router.push('/compose');
  };

  const getApiUrl = async (): Promise<string> => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      return await (window as any).electron.getApiUrl();
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Upload Contacts</h1>

        {step === 'upload' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Excel or CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Choose File
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">{file.name}</p>
                  )}
                </div>
              </div>

              <div className="text-center text-gray-500">OR</div>

              <button
                onClick={handleGoogleSheetImport}
                className="w-full py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium"
              >
                Import from Google Sheet
              </button>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : 'Parse Contacts'}
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                Review Contacts ({contacts.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Birthday
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contacts.map((contact, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleEditContact(idx, 'name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={contact.phone}
                          onChange={(e) => handleEditContact(idx, 'phone', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={contact.email || ''}
                          onChange={(e) => handleEditContact(idx, 'email', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={contact.birthday || ''}
                          onChange={(e) => handleEditContact(idx, 'birthday', e.target.value)}
                          placeholder="MM-DD"
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemoveContact(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t flex justify-between">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleProceed}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Proceed to Compose Message
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}