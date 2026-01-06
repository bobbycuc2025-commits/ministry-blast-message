const API_BASE_URL = 'http://localhost:3001';

class APIClient {
  private static instance: APIClient;

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electron?.invoke;
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<any> {
    try {
      // ✅ Electron IPC
      if (this.isElectron()) {
        console.log('[IPC]', method, endpoint);
        return await window?.electron?.invoke(endpoint, method, data) || null;
      }

      // 🌐 HTTP fallback
      const url = `${API_BASE_URL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return response.json();
    } catch (error) {
      console.error(`❌ API error (${method} ${endpoint})`, error);
      throw error;
    }
  }

  private async makeFormDataRequest(endpoint: string, formData: FormData) {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  /* ===========================
     WHATSAPP
  ============================ */

  connectWhatsApp() {
    return this.post('/whatsapp/connect');
  }

  getWhatsAppStatus() {
    return this.get('/whatsapp/status');
  }

  disconnectWhatsApp() {
    return this.post('/whatsapp/disconnect');
  }

  // ✅ RESTORED — SEND MESSAGE
  sendWhatsAppMessage(to: string, message: string) {
    return this.post('/whatsapp/send', { to, message });
  }

  /* ===========================
     BLAST
  ============================ */

  getBlastJobs() {
    return this.get('/blast/jobs');
  }

  pauseBlast(jobId: string) {
    return this.post('/blast/pause', { jobId });
  }

  resumeBlast(jobId: string) {
    return this.post('/blast/resume', { jobId });
  }

  stopBlast(jobId: string) {
    return this.post('/blast/stop', { jobId });
  }

  startBlast(jobId: string) {
    return this.post('/blast/start', { jobId });
  }

  createBlast(formData: FormData) {
    return this.makeFormDataRequest('/blast/create', formData);
  }

  /* ===========================
     SETTINGS / AUTH / ETC
  ============================ */

  getSettings() {
    return this.get('/settings');
  }

  saveSettings(settings: any) {
    return this.post('/settings', settings);
  }

  login(password: string) {
    return this.post('/auth/login', { password });
  }

  setupPassword(password: string) {
    return this.post('/auth/initialize', { password });
  }

  checkHealth() {
    return this.get('/health');
  }

  /* ===========================
     GENERIC
  ============================ */

  get(endpoint: string) {
    return this.makeRequest(endpoint, 'GET');
  }

  post(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, 'POST', data);
  }
}

export const api = APIClient.getInstance();
