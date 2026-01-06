import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Compose() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('blast_contacts');
    if (stored) {
      setContacts(JSON.parse(stored));
    } else {
      router.push('/upload');
    }
  }, []);

  useEffect(() => {
    if (contacts.length > 0 && message) {
      const first = contacts[0];
      const previewMsg = message
        .replace(/\{\{name\}\}/g, first.name || 'John Doe')
        .replace(/\{\{phone\}\}/g, first.phone || '1234567890')
        .replace(/\{\{email\}\}/g, first.email || 'email@example.com');
      setPreview(previewMsg);
    }
  }, [message, contacts]);

  const insertPlaceholder = (placeholder: string) => {
    setMessage(message + `{{${placeholder}}}`);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/blast/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts,
          message,
          channel
        })
      });

      if (!response.ok) throw new Error('Failed to create blast');

      const data = await response.json();
      localStorage.removeItem('blast_contacts');
      router.push(`/queue?jobId=${data.jobId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to send blast');
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

  const messageTemplates = [
    {
      name: 'Welcome Message',
      content: 'Hello {{name}}! Welcome to our church family. We\'re blessed to have you. See you at our next service!'
    },
    {
      name: 'Event Invitation',
      content: 'Hi {{name}}! You\'re invited to our special event this Sunday at 10 AM. Hope to see you there! 🙏'
    },
    {
      name: 'Prayer Request Follow-up',
      content: 'Hello {{name}}, we\'ve been keeping you in our prayers. Just checking in to see how you\'re doing. God bless! 💙'
    },
    {
      name: 'Service Reminder',
      content: 'Hi {{name}}! Reminder: Service tomorrow at 9 AM. Looking forward to worshipping with you! 🙌'
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Compose Message</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Channel
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium ${
                    channel === 'whatsapp'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  📱 WhatsApp
                </button>
                <button
                  onClick={() => setChannel('sms')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium ${
                    channel === 'sms'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  💬 SMS
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Message Templates
              </label>
              <select
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">-- Select Template --</option>
                {messageTemplates.map((template, idx) => (
                  <option key={idx} value={template.content}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your message here..."
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500">
                  {message.length} characters
                </p>
                <p className="text-sm text-gray-500">
                  {contacts.length} recipients
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Insert Placeholders
              </label>
              <div className="flex flex-wrap gap-2">
                {['name', 'phone', 'email'].map((placeholder) => (
                  <button
                    key={placeholder}
                    onClick={() => insertPlaceholder(placeholder)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    {`{{${placeholder}}}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/upload')}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Sending...' : 'Send Blast'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Sample with first contact:
              </p>
              <div className="bg-white p-3 rounded-lg border whitespace-pre-wrap">
                {preview || 'Your message preview will appear here...'}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Recipients ({contacts.length})</h3>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {contacts.slice(0, 10).map((contact, idx) => (
                  <div key={idx} className="p-3 border-b last:border-b-0">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  </div>
                ))}
                {contacts.length > 10 && (
                  <div className="p-3 text-center text-sm text-gray-500">
                    +{contacts.length - 10} more contacts
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use placeholders to personalize messages</li>
                <li>• Keep messages concise and clear</li>
                <li>• Include a clear call-to-action</li>
                <li>• Test with a small group first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}