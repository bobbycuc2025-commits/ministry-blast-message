# Ministry Messenger - Quick Start Guide

## 🚀 Get Running in 15 Minutes

### Step 1: Clone & Install (3 minutes)

```bash
# Create project folder
mkdir ministry-messenger
cd ministry-messenger

# Initialize with the structure provided
# Copy all the code files into their respective folders

# Install dependencies
pnpm install
cd apps/api && pnpm install && cd ../..
cd apps/ui && pnpm install && cd ../..
cd apps/main && pnpm install && cd ../..
```

### Step 2: Google Sheets Setup (5 minutes)

1. **Create Google Sheet**
   - Go to Google Sheets
   - Create new spreadsheet: "Ministry Messenger DB"
   - Note the Spreadsheet ID from URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

2. **Create Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable Google Sheets API
   - Create Service Account
   - Download JSON credentials as `google-credentials.json`

3. **Share Sheet**
   - Open your spreadsheet
   - Click Share
   - Add the service account email (from JSON file)
   - Give Editor access

### Step 3: Configure Environment (2 minutes)

**apps/api/.env**
```bash
cp apps/api/.env.example apps/api/.env
# Edit with your values:
GOOGLE_SPREADSHEET_ID=your_id_here
GOOGLE_CREDENTIALS_PATH=./config/google-credentials.json
```

**apps/ui/.env**
```bash
cp apps/ui/.env.example apps/ui/.env
# Keep default for development:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Add Google credentials**
```bash
mkdir apps/api/config
cp /path/to/your/google-credentials.json apps/api/config/
```

### Step 4: Start Development (2 minutes)

```bash
# Start everything at once
pnpm dev
```

This starts:
- API on http://localhost:3001
- UI on http://localhost:3000
- Electron app (auto-opens)

### Step 5: First Test (3 minutes)

1. **Create Test Contacts Excel**
   - Open Excel
   - Add columns: Name, Phone, Email, Birthday
   - Add 2-3 test contacts
   - Save as `test-contacts.xlsx`

2. **Upload & Test**
   - Open http://localhost:3000
   - Click "Upload Contacts"
   - Upload your test file
   - Review contacts
   - Click "Proceed to Compose Message"
   - Write a test message
   - Send (will fail without WhatsApp/SMS setup, but you'll see the flow)

---

## 📱 WhatsApp Setup (Optional - 10 minutes)

```bash
cd apps/api
pnpm add @open-wa/wa-automate
```

Add to `.env`:
```bash
WHATSAPP_SESSION_NAME=ministry_messenger
WHATSAPP_HEADLESS=false
```

Start API:
```bash
cd apps/api
pnpm start
```

Scan QR code with WhatsApp on your phone. Done!

---

## 💬 SMS Setup (Optional - 5 minutes)

### Option A: Termii (Nigeria)
1. Sign up at [termii.com](https://termii.com)
2. Get API key
3. Add to `.env`:
```bash
SMS_PROVIDER=termii
TERMII_API_KEY=your_api_key
TERMII_SENDER_ID=Ministry
```

### Option B: Twilio (Global)
1. Sign up at [twilio.com](https://twilio.com)
2. Get credentials
3. Add to `.env`:
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📦 Build for Production

### Desktop App
```bash
pnpm build:electron
# Output: dist/Ministry-Messenger-Setup-1.0.0.exe (Windows)
```

### Web App (Deploy to Vercel)
```bash
cd apps/ui
vercel --prod
```

### Android APK
```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize TWA
bubblewrap init --manifest https://your-domain.vercel.app/manifest.json

# Build
bubblewrap build
```

---

## 🎯 Common Commands

```bash
# Development
pnpm dev                    # Start all services

# Build
pnpm build                  # Build all apps
pnpm build:electron         # Desktop app only
pnpm build:pwa              # Web app only

# Run individually
cd apps/api && pnpm dev     # API only
cd apps/ui && pnpm dev      # UI only
cd apps/main && pnpm start  # Electron only
```

---

## 🐛 Troubleshooting

### "Port 3001 already in use"
```bash
# Find and kill process
# Windows: netstat -ano | findstr :3001
# Mac/Linux: lsof -i :3001
# Then kill the process
```

### "Cannot find google-credentials.json"
```bash
# Check file exists
ls apps/api/config/google-credentials.json

# Check path in .env
cat apps/api/.env | grep GOOGLE_CREDENTIALS_PATH
```

### "WhatsApp not connecting"
```bash
# Delete session and reconnect
rm -rf apps/api/.wa-data
cd apps/api && pnpm start
# Scan QR code again
```

### "Module not found" errors
```bash
# Reinstall all dependencies
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install
cd apps/api && pnpm install
cd apps/ui && pnpm install
cd apps/main && pnpm install
```

---

## 📚 Next Steps

1. **Customize Messages**: Edit `apps/api/src/blast/birthday.scheduler.ts`
2. **Add Features**: See `CONTINUATION_PROMPT.md`
3. **Deploy**: Follow `DEPLOYMENT_GUIDE.md`
4. **Learn More**: Read `SETUP_INSTRUCTIONS.md`

---

## 🆘 Need Help?

Check these files:
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `CONTINUATION_PROMPT.md` - How to add features

---

## ✅ You're Ready!

Your Ministry Messenger is now running! 

- Upload contacts
- Send blasts
- Track delivery
- Auto-convert to members
- Enjoy automated birthday messages

**Happy messaging! 🎉**