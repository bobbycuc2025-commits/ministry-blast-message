# Ministry Messenger - Complete Setup Guide

## Prerequisites

Install the following:
- Node.js 18+ and pnpm (`npm install -g pnpm`)
- VSCode with extensions: ESLint, Prettier, TypeScript
- Java JDK 11+ (for TWA/Android build)
- Android SDK (for TWA build)

## 1. Initial Setup

```bash
# Clone and install dependencies
cd ministry-messenger
pnpm install

# Create environment files
cp apps/api/.env.example apps/api/.env
cp apps/ui/.env.example apps/ui/.env
```

## 2. Google Sheets Database Setup

### Create Google Sheet
1. Go to Google Sheets and create a new spreadsheet
2. Name it "Ministry Messenger Database"
3. Create sheets: "Church Members", "Blast History", "Settings"
4. In "Church Members" sheet, add headers:
   ```
   Name | Phone | Email | Birthday | Join Date | Status
   ```

### Set up Google Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create Service Account
   - Download JSON key file
5. Share your Google Sheet with the service account email
6. Save credentials to `apps/api/config/google-credentials.json`

### Configure API
In `apps/api/.env`:
```env
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_CREDENTIALS_PATH=./config/google-credentials.json
PORT=3001
```

## 3. WhatsApp Setup (wa-automate)

```bash
cd apps/api
pnpm add @open-wa/wa-automate
```

Add to `.env`:
```env
WHATSAPP_SESSION_NAME=ministry_messenger
WHATSAPP_HEADLESS=true
```

On first run, scan QR code to connect WhatsApp Web.

## 4. SMS Setup (Termii or Twilio)

### Option A: Termii (Nigeria)
```env
SMS_PROVIDER=termii
TERMII_API_KEY=your_api_key
TERMII_SENDER_ID=MinistryMsg
```

### Option B: Twilio (Global)
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 5. Development Mode

```bash
# Terminal 1: Start all services
pnpm dev

# This runs:
# - API server on http://localhost:3001
# - Next.js UI on http://localhost:3000
# - Electron app (opens automatically)
```

## 6. Build Electron Desktop App

```bash
# Build for current platform
pnpm build:electron

# Build for specific platforms
pnpm build:electron --win --x64
pnpm build:electron --mac --arm64
pnpm build:electron --linux --x64

# Output in: dist/
```

## 7. Build PWA

```bash
# Build PWA
pnpm build:pwa

# Generate PWA icons
pnpm pwa:generate

# Deploy to Vercel
pnpm deploy
```

### Generate PWA Icons
Create `scripts/generate-pwa-assets.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = 'build/icon.png'; // Your source icon (1024x1024)

async function generateIcons() {
  if (!fs.existsSync('apps/ui/public/icons')) {
    fs.mkdirSync('apps/ui/public/icons', { recursive: true });
  }

  for (const size of sizes) {
    await sharp(inputIcon)
      .resize(size, size)
      .toFile(`apps/ui/public/icons/icon-${size}x${size}.png`);
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons();
```

## 8. Build TWA (Android APK) with Bubblewrap

### Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### Setup TWA
```bash
# Initialize TWA
bubblewrap init --manifest https://your-domain.vercel.app/manifest.json

# Follow prompts:
# - Package ID: com.ministry.messenger
# - App name: Ministry Messenger
# - Domain: your-domain.vercel.app
```

### Generate Android Keystore
```bash
keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Digital Asset Links
Add to `apps/ui/public/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.ministry.messenger",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

Get fingerprint:
```bash
keytool -list -v -keystore android.keystore -alias android
```

### Build APK
```bash
# Build release APK
bubblewrap build

# Output: app-release-signed.apk
```

### Test APK
```bash
# Install on connected Android device
adb install app-release-signed.apk
```

## 9. Deploy to Vercel

### Setup Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd apps/ui
vercel --prod
```

### Configure Environment Variables in Vercel
Add in Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### API Deployment
For API, deploy to:
- Railway.app
- Render.com
- DigitalOcean App Platform
- Or same Vercel project with Serverless Functions

## 10. Mobile Usage

### PWA on Mobile
1. Open https://your-domain.vercel.app in mobile browser
2. Browser will prompt "Add to Home Screen"
3. App installs and works like native app

### TWA/APK on Android
1. Share APK file or publish to Google Play Store
2. Install APK
3. App looks and feels like native Android app

## 11. Testing Workflow

### Test Contact Upload
1. Create Excel file with columns: Name, Phone, Email, Birthday
2. Upload via "Upload Contacts" page
3. Review contacts (edit/remove as needed)
4. Proceed to compose message

### Test Blast
1. Compose message with placeholders: `{{name}}`, `{{phone}}`
2. Select channel (WhatsApp or SMS)
3. Send blast
4. Monitor progress in Queue page

### Test Birthday Messages
1. Add members with birthdays to Google Sheet
2. Set birthday format: MM-DD (e.g., 12-25)
3. Birthday messages auto-send at 8 AM daily

## 12. Production Checklist

- [ ] Set up Google Sheets with service account
- [ ] Configure WhatsApp Business API
- [ ] Set up SMS provider (Termii/Twilio)
- [ ] Update manifest.json with real domain
- [ ] Generate production signing keys
- [ ] Set up Digital Asset Links for TWA
- [ ] Deploy API to production server
- [ ] Deploy UI to Vercel
- [ ] Test all platforms (Desktop, Web, Mobile)
- [ ] Set up monitoring and error tracking

## 13. Features

### Desktop App (Electron)
✅ Runs on Windows, macOS, Linux
✅ Offline capability
✅ System tray integration
✅ Auto-updates

### Web App (PWA)
✅ Works on any device with browser
✅ Installable on mobile
✅ Offline support with service workers
✅ Push notifications

### Android App (TWA)
✅ Native Android app experience
✅ Full screen (no browser UI)
✅ Can be published to Play Store
✅ Uses same codebase as web

### Database (Google Sheets)
✅ Easy to manage
✅ Real-time sync
✅ No database hosting costs
✅ Built-in backup (Google Drive)

### Automated Features
✅ Birthday messages (daily at 8 AM)
✅ Anniversary messages (monthly)
✅ Weekly birthday reminders
✅ Weekend service reminders
✅ Lead to member conversion

## Troubleshooting

### Electron app won't start
- Check if API port 3001 is available
- Check logs in: `~/.config/ministry-messenger/logs`

### WhatsApp not connecting
- Clear session: Delete `.wa-data` folder
- Ensure phone has internet
- Re-scan QR code

### PWA not installing
- Check manifest.json is accessible
- Ensure HTTPS (required for PWA)
- Check service worker registration

### TWA build fails
- Verify Java JDK installed: `java -version`
- Check Android SDK path in system variables
- Ensure keystore file exists

### Google Sheets errors
- Verify service account has Sheet access
- Check spreadsheet ID is correct
- Ensure API is enabled in GCP

## Support

For issues, check logs:
- Electron: `~/.config/ministry-messenger/logs/`
- API: `apps/api/logs/`
- Browser: F12 Developer Console

---

## Next Steps After Setup

Once setup is complete, you can:

1. **Customize Messages**: Edit birthday/anniversary templates in `birthday.scheduler.ts`
2. **Add Features**: Extend with prayer requests, event reminders, tithes tracking
3. **Branding**: Replace icons in `build/` folder
4. **Analytics**: Add Google Analytics or Mixpanel
5. **Backup**: Set up automated Google Sheet backups

Enjoy your Ministry Messenger! 🙏