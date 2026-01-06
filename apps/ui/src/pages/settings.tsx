import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import QRCode from 'qrcode.react';

export default function Settings() {
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhatsAppStatus();
    const interval = setInterval(fetchWhatsAppStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchWhatsAppStatus = async () => {
    try {
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/whatsapp/status`);
      const data = await response.json();
      setWhatsappStatus(data);
    } catch (error) {
      console.error('Failed to fetch WhatsApp status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return;

    try {
      const apiUrl = await getApiUrl();
      await fetch(`${apiUrl}/whatsapp/disconnect`, { method: 'POST' });
      alert('WhatsApp disconnected successfully');
      fetchWhatsAppStatus();
    } catch (error) {
      alert('Failed to disconnect WhatsApp');
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
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          {/* WhatsApp Connection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">📱</span>
              WhatsApp Connection
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading WhatsApp status...</p>
              </div>
            ) : whatsappStatus?.isReady ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-semibold flex items-center">
                        <span className="text-2xl mr-2">✅</span>
                        WhatsApp Connected
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        {whatsappStatus.message}
                      </p>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> Your WhatsApp session is active. You can now send messages to your contacts!
                  </p>
                </div>
              </div>
            ) : whatsappStatus?.qrCode ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-semibold mb-2">
                    ⚠️ WhatsApp Not Connected
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Scan the QR code below with WhatsApp on your phone to connect.
                  </p>
                </div>

                <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Scan This QR Code</h3>
                    
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <QRCode 
                        value={whatsappStatus.qrCode} 
                        size={256}
                        level="M"
                      />
                    </div>

                    <div className="mt-6 space-y-2 text-sm text-gray-600 max-w-md">
                      <p className="font-semibold text-gray-800">📱 How to scan:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open WhatsApp on your phone</li>
                        <li>Tap <strong>⋮ menu</strong> (Android) or <strong>Settings</strong> (iPhone)</li>
                        <li>Tap <strong>Linked Devices</strong></li>
                        <li>Tap <strong>Link a Device</strong></li>
                        <li>Point your camera at this QR code</li>
                      </ol>
                    </div>

                    <button
                      onClick={fetchWhatsAppStatus}
                      className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      🔄 Refresh QR Code
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <p className="text-gray-600">⏳ Initializing WhatsApp...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait, QR code will appear shortly</p>
                </div>
                <button
                  onClick={fetchWhatsAppStatus}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Check Again
                </button>
              </div>
            )}
          </div>

          {/* Anti-Spam Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">🛡️</span>
              Anti-Spam Protection
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">✅ Protection Active</p>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• 3-8 second random delay between messages</p>
                  <p>• Maximum 40 messages per hour</p>
                  <p>• Maximum 200 messages per day</p>
                  <p>• 1 minute pause after every 10 messages</p>
                  <p>• Only sends during 9 AM - 9 PM</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Tip:</strong> These limits help prevent your WhatsApp from being flagged as spam. The system automatically manages delays and pauses.
                </p>
              </div>
            </div>
          </div>

          {/* SMS Provider */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">💬</span>
              SMS Provider
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm">
                  SMS provider is configured in your server environment variables. Contact your administrator to change SMS settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Provider</p>
                  <p className="font-semibold">Termii / Twilio</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Sheets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Google Sheets Database
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✅ Connected</p>
                <p className="text-green-700 text-sm mt-1">
                  Your church members and blast history are automatically saved to Google Sheets.
                </p>
              </div>

              <a
                href="https://docs.google.com/spreadsheets/d/1Ru01Ylfqgi5VOf9qfrV3wd3D9OQGmbx72kQXnF0VwSw/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📊 Open Google Sheet
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}