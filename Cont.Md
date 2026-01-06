# Continuation Prompt for Ministry Messenger

Use this prompt if you need to continue implementation or get help with specific features:

---

## Context Summary

I'm building **Ministry Messenger**, a comprehensive church messaging blast system with these components:

### Tech Stack
- **Desktop App**: Electron.js (Windows, macOS, Linux)
- **Web App**: Next.js + PWA (Progressive Web App)
- **Mobile App**: TWA (Trusted Web Activity) via Bubblewrap → Android APK
- **Backend API**: NestJS (Node.js)
- **Database**: Google Sheets (via Google Sheets API)
- **Messaging**: WhatsApp (wa-automate) + SMS (Termii/Twilio)

### Architecture
```
monorepo/
├── apps/
│   ├── main/    # Electron (forks API)
│   ├── api/     # NestJS backend
│   └── ui/      # Next.js frontend
```

### Key Features Implemented
1. ✅ Contact upload (Excel, CSV, Google Sheets)
2. ✅ Contact review and editing interface
3. ✅ Message composition with placeholders
4. ✅ Blast sending (WhatsApp & SMS)
5. ✅ Real-time progress tracking
6. ✅ Lead-to-member conversion (auto-saves to Google Sheets)
7. ✅ Birthday messages (automated scheduler)
8. ✅ Anniversary messages
9. ✅ Service reminders
10. ✅ Google Sheets as database

### Deployment Targets
- ✅ Desktop: Electron builds for Win/Mac/Linux
- ✅ Web: Vercel (PWA-enabled)
- ✅ Mobile: Android APK via Bubblewrap
- ✅ API: Railway.app

---

## What I Need Help With

[DESCRIBE YOUR SPECIFIC NEED HERE - Examples below]

### Example 1: Adding New Features
"I want to add these features:
1. Prayer request tracking
2. Tithe/donation reminders
3. Event RSVP system
4. Multi-language support
Please provide the code for these features following the existing architecture."

### Example 2: Fixing Issues
"I'm getting this error when [describe action]:
```
[paste error message]
```
The error occurs in [file name]. Here's the relevant code:
```typescript
[paste code snippet]
```
Please help me fix this."

### Example 3: Optimization
"The blast sending is too slow. Currently it takes [X seconds] to send [Y messages]. 
I want to:
1. Implement batching
2. Add retry logic
3. Optimize rate limiting
Please show me how to optimize the BlastService."

### Example 4: Extending Functionality
"I want to extend the system to:
1. Support Telegram messaging
2. Add voice call blasts
3. Integrate with Zoom for virtual events
4. Add analytics dashboard
Please provide implementation guide."

### Example 5: Testing & Quality
"I need to add:
1. Unit tests for all services
2. Integration tests for API endpoints
3. E2E tests for critical user flows
4. CI/CD pipeline configuration
Please provide test setup and examples."

---

## Implementation Files Completed

1. **Root Configuration**
   - package.json (workspace setup)
   - pnpm-workspace.yaml
   - electron-builder.json

2. **Electron App**
   - apps/main/src/main.ts (main process)
   - apps/main/src/preload.ts (context bridge)

3. **Backend API**
   - apps/api/src/database/database.service.ts (Google Sheets integration)
   - apps/api/src/blast/blast.service.ts (core blast logic)
   - apps/api/src/blast/blast.controller.ts (API endpoints)
   - apps/api/src/blast/birthday.scheduler.ts (automated messages)

4. **Frontend UI**
   - apps/ui/src/pages/upload.tsx (contact upload & review)
   - apps/ui/src/pages/compose.tsx (message composition)
   - apps/ui/src/pages/queue.tsx (progress tracking)
   - apps/ui/next.config.js (PWA configuration)
   - apps/ui/public/manifest.json (PWA manifest)

5. **Mobile/TWA**
   - twa-manifest.json (Bubblewrap config)

6. **Documentation**
   - SETUP_INSTRUCTIONS.md (complete setup guide)
   - DEPLOYMENT_GUIDE.md (deployment for all platforms)

---

## Current Implementation Status

### ✅ Completed
- Electron desktop app structure
- NestJS API with Google Sheets integration
- Next.js UI with PWA support
- Contact upload (Excel/CSV/Google Sheets)
- Contact review interface
- Message composition with templates
- Blast sending (WhatsApp & SMS)
- Progress tracking
- Lead-to-member conversion
- Birthday/anniversary automation
- Service reminders
- TWA/Bubblewrap configuration

### 🔄 Partially Implemented
- WhatsApp service (needs wa-automate setup)
- SMS service (needs provider configuration)
- Authentication (basic structure exists)
- Error handling (needs enhancement)

### ❌ Not Yet Implemented
- Prayer request management
- Event management
- Analytics dashboard
- Tithe/donation tracking
- Multi-user/multi-church support
- Advanced reporting
- Backup/restore functionality
- Admin panel
- Role-based permissions

---

## Expected Response Format

Please provide:

1. **Code Files**: Complete, ready-to-use files with proper imports
2. **Installation Steps**: Any new dependencies needed
3. **Configuration**: Environment variables or config changes
4. **Testing Instructions**: How to test the new feature
5. **Deployment Notes**: Any changes needed for deployment

---

## Additional Context

### Current Database Schema (Google Sheets)

**Church Members Sheet**
```
Name | Phone | Email | Birthday | Join Date | Status | Role | Notes
```

**Blast History Sheet**
```
ID | Date | Time | Channel | Message | Total | Successful | Failed | Created By
```

**Settings Sheet**
```
Key | Value | Description
```

### API Endpoints Currently Available
```
POST   /blast/parse-contacts       - Parse uploaded file
POST   /blast/import-from-sheet    - Import from Google Sheets
POST   /blast/create               - Create new blast job
GET    /blast/job/:id              - Get job status
GET    /blast/jobs                 - List all jobs
GET    /blast/members              - Get all members
GET    /blast/birthdays/upcoming   - Get upcoming birthdays
POST   /blast/birthday/send-now    - Manually trigger birthday messages
```

### Environment Variables
```
# API
NODE_ENV=production
PORT=3001
GOOGLE_SPREADSHEET_ID=
GOOGLE_CREDENTIALS_PATH=
WHATSAPP_SESSION_NAME=
SMS_PROVIDER=
TERMII_API_KEY=
JWT_SECRET=

# UI
NEXT_PUBLIC_API_URL=
```

---

## My Specific Request

[WRITE YOUR DETAILED REQUEST HERE]

I need help with: [describe what you need]

Expected outcome: [describe what you want to achieve]

Constraints: [any technical limitations or requirements]

Timeline: [if relevant]

---

## Files I Need

Please provide these files:
1. [File 1 name and purpose]
2. [File 2 name and purpose]
3. [etc.]

And update these existing files:
1. [File to update]
2. [File to update]

---

Thank you! Please provide complete, production-ready code that follows the existing architecture and coding style.