ministry-messenger/
├── package.json (root workspace)
├── pnpm-workspace.yaml
├── tsconfig.json
├── .gitignore
├── apps/
│   ├── main/                    # Electron main process
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   └── ipc-handlers.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api/                     # NestJS backend (forked process)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   ├── database.service.ts
│   │   │   │   └── encryption.service.ts
│   │   │   ├── whatsapp/
│   │   │   │   ├── whatsapp.module.ts
│   │   │   │   ├── whatsapp.service.ts
│   │   │   │   └── whatsapp.gateway.ts
│   │   │   ├── sms/
│   │   │   │   ├── sms.module.ts
│   │   │   │   └── sms.service.ts
│   │   │   ├── blast/
│   │   │   │   ├── blast.module.ts
│   │   │   │   ├── blast.service.ts
│   │   │   │   └── blast.worker.ts
│   │   │   └── shared/
│   │   │       ├── types.ts
│   │   │       └── utils.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ui/                      # Next.js renderer
│       ├── src/
│       │   ├── pages/
│       │   │   ├── _app.tsx
│       │   │   ├── index.tsx
│       │   │   ├── auth.tsx
│       │   │   ├── upload.tsx
│       │   │   ├── compose.tsx
│       │   │   ├── queue.tsx
│       │   │   ├── reports.tsx
│       │   │   └── settings.tsx
│       │   ├── components/
│       │   │   ├── Layout.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   ├── lib/
│       │   │   ├── ipc.ts
│       │   │   └── store.ts
│       │   └── styles/
│       │       └── globals.css
│       ├── public/
│       ├── next.config.js
│       ├── package.json
│       ├── tsconfig.json
│       └── tailwind.config.js
├── build/
│   └── electron-builder.json
└── README.md