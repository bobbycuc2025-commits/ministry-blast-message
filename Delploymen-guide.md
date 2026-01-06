# Complete Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT DEVICES                     │
├─────────────────┬─────────────┬─────────────────────┤
│  Desktop App    │   Web/PWA   │   Android APK/TWA   │
│  (Electron)     │  (Vercel)   │   (Bubblewrap)      │
└────────┬────────┴──────┬──────┴──────────┬──────────┘
         │               │                 │
         └───────────────┼─────────────────┘
                         │
                    ┌────▼────┐
                    │   API   │
                    │(Railway)│
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Google  │    │WhatsApp │    │   SMS   │
    │ Sheets  │    │   API   │    │Provider │
    └─────────┘    └─────────┘    └─────────┘
```

## Step 1: Prepare Your Code

### 1.1 Clone or Initialize Project
```bash
mkdir ministry-messenger
cd ministry-messenger
git init
```

### 1.2 Install All Dependencies
```bash
pnpm install
cd apps/api && pnpm install
cd ../ui && pnpm install
cd ../main && pnpm install
```

### 1.3 Configure Environment Variables

**apps/api/.env**
```env
NODE_ENV=production
PORT=3001

# Google Sheets
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_CREDENTIALS_PATH=./config/google-credentials.json

# WhatsApp (wa-automate)
WHATSAPP_SESSION_NAME=ministry_messenger
WHATSAPP_HEADLESS=true
WHATSAPP_USE_CHROME=true

# SMS Provider (Choose one)
SMS_PROVIDER=termii
TERMII_API_KEY=your_termii_api_key
TERMII_SENDER_ID=MinistryMsg

# OR for Twilio
# SMS_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# Security
JWT_SECRET=your_super_secure_jwt_secret_key
API_KEY=your_api_key_for_client_auth
```

**apps/ui/.env.production**
```env
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

## Step 2: Deploy API (Railway.app)

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

### 2.2 Deploy API
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
cd apps/api
railway up
```

### 2.3 Configure Railway
1. Add environment variables in Railway dashboard
2. Add Google credentials as file:
   ```bash
   railway variables set GOOGLE_CREDENTIALS="$(cat config/google-credentials.json)"
   ```
3. Generate domain: `your-api.railway.app`

### 2.4 Verify API Deployment
```bash
curl https://your-api.railway.app/health
```

## Step 3: Deploy Web App (Vercel)

### 3.1 Prepare Next.js for Deployment
```bash
cd apps/ui
# Update .env.production with Railway API URL
echo "NEXT_PUBLIC_API_URL=https://your-api.railway.app" > .env.production
```

### 3.2 Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3.3 Configure Vercel
1. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Railway API URL
2. Configure domain (e.g., `ministrymessenger.vercel.app`)
3. Enable HTTPS (automatic)

### 3.4 Verify Web Deployment
Visit: `https://your-domain.vercel.app`

## Step 4: Build Desktop App (Electron)

### 4.1 Update Configuration
```javascript
// apps/main/src/main.ts
const apiUrl = 'https://your-api.railway.app';
```

### 4.2 Build for All Platforms

**On Windows:**
```bash
pnpm build:electron --win --x64
```

**On macOS:**
```bash
pnpm build:electron --mac --universal
```

**On Linux:**
```bash
pnpm build:electron --linux --x64
```

### 4.3 Code Sign (Optional but Recommended)

**Windows:**
```bash
# Get code signing certificate
# Update electron-builder.json:
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

**macOS:**
```bash
# Get Apple Developer certificate
# Update electron-builder.json:
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAMID)"
  }
}
```

### 4.4 Distribute Desktop App

**Option A: Direct Download**
- Upload installers to your website
- Provide download links

**Option B: Auto-Updates (GitHub Releases)**
```bash
# Create GitHub release
gh release create v1.0.0 \
  dist/Ministry-Messenger-1.0.0.exe \
  dist/Ministry-Messenger-1.0.0.dmg \
  dist/ministry-messenger_1.0.0_amd64.deb
```

## Step 5: Build PWA

### 5.1 Generate PWA Icons
```bash
cd apps/ui
pnpm pwa:generate
```

### 5.2 Update Manifest
```json
// apps/ui/public/manifest.json
{
  "start_url": "https://your-domain.vercel.app",
  "scope": "https://your-domain.vercel.app"
}
```

### 5.3 Test PWA
1. Open in Chrome: `https://your-domain.vercel.app`
2. Check DevTools > Application > Manifest
3. Check Service Worker registration
4. Test "Add to Home Screen"

## Step 6: Build Android App (TWA with Bubblewrap)

### 6.1 Install Prerequisites
```bash
# Install Java JDK
# Windows: Download from Oracle
# macOS: brew install openjdk@11
# Linux: sudo apt install openjdk-11-jdk

# Install Android SDK
# Download Android Studio or use sdkmanager
```

### 6.2 Initialize TWA
```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize
cd ministry-messenger
bubblewrap init --manifest https://your-domain.vercel.app/manifest.json
```

Follow prompts:
```
? Domain: your-domain.vercel.app
? Package ID: com.ministry.messenger
? App name: Ministry Messenger
? App short name: MinistryMsg
? Start URL: /
? Theme color: #2563eb
? Background color: #ffffff
? Icon URL: https://your-domain.vercel.app/icons/icon-512x512.png
```

### 6.3 Generate Signing Key
```bash
keytool -genkey -v \
  -keystore android.keystore \
  -alias android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Enter details when prompted
# Remember password - you'll need it!
```

### 6.4 Setup Digital Asset Links

Get SHA-256 fingerprint:
```bash
keytool -list -v -keystore android.keystore -alias android
```

Create `apps/ui/public/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.ministry.messenger",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

Deploy to Vercel:
```bash
cd apps/ui
vercel --prod
```

Verify:
```bash
curl https://your-domain.vercel.app/.well-known/assetlinks.json
```

### 6.5 Build APK
```bash
bubblewrap build

# Output: app-release-signed.apk
```

### 6.6 Test APK
```bash
# Connect Android device via USB
# Enable USB debugging

# Install
adb install app-release-signed.apk

# Or use Android Studio
```

### 6.7 Publish to Google Play Store

1. Create Google Play Console account ($25 one-time fee)
2. Create new app
3. Upload APK
4. Fill in store listing
5. Set pricing (free)
6. Submit for review

## Step 7: Setup Google Sheets Database

### 7.1 Create Spreadsheet
1. Open Google Sheets
2. Create new spreadsheet: "Ministry Messenger DB"
3. Create sheets:
   - **Church Members**: Name | Phone | Email | Birthday | Join Date | Status | Role
   - **Blast History**: ID | Date | Channel | Message | Recipients | Status
   - **Settings**: Key | Value

### 7.2 Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project: "Ministry Messenger"
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create Service Account:
   - IAM & Admin > Service Accounts
   - Create Service Account
   - Download JSON key
5. Share spreadsheet with service account email

### 7.3 Upload Credentials to Railway
```bash
railway variables set GOOGLE_CREDENTIALS="$(cat google-credentials.json | base64)"

# Then in your code, decode:
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString());
```

## Step 8: Configure WhatsApp

### 8.1 First-Time Setup (Local)
```bash
cd apps/api
pnpm start

# QR code will appear in console
# Scan with WhatsApp on your phone
# Session saved to .wa-data folder
```

### 8.2 Deploy Session to Railway
```bash
# Zip session data
cd .wa-data
zip -r session.zip *

# Upload to Railway
railway volumes create
railway volumes mount .wa-data
```

### 8.3 Keep WhatsApp Alive
Railway will sleep after 30 minutes. Keep alive with:
```typescript
// Add to your API main.ts
setInterval(() => {
  console.log('Keep alive ping');
}, 15 * 60 * 1000); // Every 15 minutes
```

Or use a separate ping service like UptimeRobot.

## Step 9: Configure SMS Provider

### Option A: Termii (Nigeria)
1. Sign up at [termii.com](https://termii.com)
2. Get API key from dashboard
3. Create sender ID
4. Add to Railway env vars

### Option B: Twilio (Global)
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Buy phone number
4. Add to Railway env vars

## Step 10: Testing Checklist

### Desktop App
- [ ] Installs correctly on Windows
- [ ] Installs correctly on macOS
- [ ] Installs correctly on Linux
- [ ] Connects to API
- [ ] Sends WhatsApp messages
- [ ] Sends SMS messages
- [ ] Uploads contacts
- [ ] Views reports

### Web App (PWA)
- [ ] Loads on desktop browser
- [ ] Loads on mobile browser
- [ ] Service worker registers
- [ ] Works offline (cached pages)
- [ ] "Add to Home Screen" prompt appears
- [ ] Installed PWA works correctly
- [ ] Push notifications work (if implemented)

### Android App (TWA)
- [ ] Installs from APK
- [ ] Opens without browser UI
- [ ] Back button works correctly
- [ ] Handles deep links
- [ ] Splash screen displays
- [ ] All features work

### Backend
- [ ] API endpoints respond
- [ ] Google Sheets reads/writes
- [ ] WhatsApp sends messages
- [ ] SMS sends messages
- [ ] File uploads work
- [ ] Birthday scheduler runs
- [ ] Error handling works

## Step 11: Monitoring & Maintenance

### Setup Monitoring
1. **Sentry** for error tracking
   ```bash
   pnpm add @sentry/node @sentry/nextjs
   ```

2. **LogRocket** for session replay
   ```bash
   pnpm add logrocket
   ```

3. **UptimeRobot** for uptime monitoring
   - Monitor: `https://your-api.railway.app/health`

### Regular Maintenance
- Check WhatsApp session weekly
- Monitor SMS credits
- Review error logs
- Update dependencies monthly
- Backup Google Sheets weekly

## Step 12: User Documentation

Create user guides for:
1. How to upload contacts
2. How to send blasts
3. How to view reports
4. Troubleshooting common issues

## Costs Estimate

| Service | Cost |
|---------|------|
| Railway API hosting | $5-10/month |
| Vercel hosting | Free |
| Google Sheets | Free |
| SMS (Termii) | ~$0.002/SMS |
| WhatsApp | Free |
| Google Play Store | $25 one-time |
| **Total Monthly** | **~$10-15** |

## Support Resources

- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Bubblewrap: https://github.com/GoogleChromeLabs/bubblewrap
- Electron: https://www.electronjs.org/docs
- Next.js: https://nextjs.org/docs

---

## Quick Command Reference

```bash
# Development
pnpm dev

# Build all
pnpm build

# Build specific platform
pnpm build:electron --win
pnpm build:pwa
pnpm build:twa

# Deploy
vercel --prod
railway up

# Test
pnpm test
pnpm test:e2e
```

Congratulations! Your Ministry Messenger is now deployed on all platforms! 🎉