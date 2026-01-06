export interface Contact {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Message {
  id: string;
  text: string;
  image_path?: string;
  created_at: string;
}

export interface BlastJob {
  id: string;
  message_id: string;
  channel: 'whatsapp' | 'sms';
  total_contacts: number;
  sent: number;
  delivered: number;
  failed: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface BlastResult {
  id: string;
  job_id: string;
  contact_id: string;
  contact_name: string;
  contact_phone: string;
  status: 'sent' | 'delivered' | 'failed';
  channel: 'whatsapp' | 'sms';
  error_message?: string;
  sent_at: string;
}

export interface Lead {
  id: string;
  contact_phone: string;
  contact_name: string;
  reply_text: string;
  received_at: string;
}

export interface Settings {
  termii_api_key?: string;
  termii_sender_id?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  whatsapp_session_active: boolean;
  auto_reply_enabled: boolean;
  auto_reply_text: string;
  min_delay_seconds: number;
  max_delay_seconds: number;
}

export interface WhatsAppStatus {
  connected: boolean;
  qrCode?: string;
  phoneNumber?: string;
}

export interface BlastProgress {
  jobId: string;
  sent: number;
  total: number;
  status: string;
}

export interface ContactUpload {
   name: string;
  phone: string;
  formattedPhone?: string;
  isValid?: boolean;
  id?: string; // <--- add this
}