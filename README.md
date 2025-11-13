# 🔒 Sealed - Your Digital Diary

A minimalist text-only digital diary for Farcaster users. Write daily thoughts and seal them forever on Base L2.

![Sealed Logo](public/icons/sealed.svg)

## ✨ Features

- **Daily Entries**: Write one entry per day with mood tracking
- **Blockchain Sealing**: Seal entries permanently on Base L2
- **Minimalist Design**: Text-only, distraction-free writing
- **Privacy First**: Your entries, your data
- **Farcaster Integration**: Native Farcaster Mini App
- **Writing Stats**: Track your progress and streaks

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Deployment**: Netlify with Edge Functions
- **Database**: SQLite via Turso (libsql)
- **Blockchain**: Base L2 (Ethereum L2)
- **Authentication**: Farcaster Mini App SDK
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Netlify CLI (optional, for local development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sealed-diary
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Initialize the database:
```bash
npm run db:init
```

5. Run the development server:
```bash
npm run dev
# or with Netlify Dev
npm run netlify:dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
sealed-diary/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── manifest/      # Farcaster manifest
│   │   ├── entries/       # Entry CRUD
│   │   ├── seal/          # Blockchain sealing
│   │   └── stats/         # User statistics
│   ├── archive/           # Archive page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Editor.tsx         # Writing interface
│   ├── Archive.tsx        # Entry list
│   ├── Navigation.tsx     # Bottom nav
│   └── Stats.tsx          # Statistics display
├── lib/                   # Utility libraries
│   ├── db.ts             # Database client
│   ├── db-edge.ts        # Edge-compatible DB
│   ├── farcaster.ts      # Farcaster SDK
│   ├── blockchain.ts     # Base L2 integration
│   └── utils.ts          # Helper functions
├── contracts/            # Smart contracts
│   └── SealedDiary.sol   # Sealing contract
├── scripts/              # Utility scripts
│   ├── init-db.js        # DB initialization
│   ├── migrate.js        # DB migrations
│   └── deploy.js         # Contract deployment
├── public/               # Static assets
│   └── icons/
│       └── sealed.svg    # App icon
├── netlify.toml          # Netlify config
├── next.config.js        # Next.js config
└── package.json          # Dependencies
```

## 🗄️ Database Schema

```sql
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  fid INTEGER NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  date INTEGER NOT NULL,
  word_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  is_sealed INTEGER DEFAULT 0,
  sealed_at INTEGER,
  tx_hash TEXT,
  content_hash TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

## 🔗 API Endpoints

### GET /api/manifest
Returns Farcaster Mini App manifest

### GET /api/entries?fid={fid}&limit={limit}
Get user entries

### POST /api/entries
Create new entry
```json
{
  "fid": 12345,
  "content": "Entry text",
  "mood": "happy"
}
```

### PUT /api/entries
Update existing entry
```json
{
  "id": "uuid",
  "fid": 12345,
  "content": "Updated text",
  "mood": "calm"
}
```

### POST /api/seal
Seal entry on blockchain
```json
{
  "id": "uuid",
  "fid": 12345,
  "txHash": "0x...",
  "contentHash": "0x..."
}
```

### GET /api/stats?fid={fid}
Get user statistics

## 🚢 Deployment

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Initialize Netlify:
```bash
netlify init
```

3. Set environment variables:
```bash
netlify env:set TURSO_DATABASE_URL "your-url"
netlify env:set TURSO_AUTH_TOKEN "your-token"
netlify env:set NEXT_PUBLIC_CONTRACT_ADDRESS "0x..."
netlify env:set NEXT_PUBLIC_APP_URL "https://your-app.netlify.app"
```

4. Deploy:
```bash
npm run netlify:deploy
```

### Deploy Smart Contract

See `scripts/deploy.js` for deployment instructions.

Quick deploy with Foundry:
```bash
forge create --rpc-url https://mainnet.base.org \
  --private-key YOUR_PRIVATE_KEY \
  src/SealedDiary.sol:SealedDiary
```

## 🧪 Testing

### Test as Farcaster Mini App

1. Create a tunnel to localhost:
```bash
# Using localtunnel
npx localtunnel --port 8888

# Or using Cloudflare tunnel
cloudflared tunnel --url http://localhost:8888
```

2. Open Warpcast Developer Tools
3. Enter your tunnel URL
4. Test in Warpcast mobile app

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TURSO_DATABASE_URL` | Turso database URL or `file:local.db` | Yes |
| `TURSO_AUTH_TOKEN` | Turso auth token (empty for local) | No |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address on Base | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL | Yes |
| `NETLIFY_USE_EDGE` | Enable edge functions | No |

## 🛠️ Development Scripts

```bash
npm run dev              # Start Next.js dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run netlify:dev     # Start with Netlify Dev
npm run netlify:build   # Build with Netlify
npm run netlify:deploy  # Deploy to Netlify
npm run db:init         # Initialize database
npm run db:migrate      # Run migrations
```

## 🔐 Smart Contract

The `SealedDiary` contract on Base L2 provides:

- **Permanent sealing**: Entries sealed on-chain cannot be modified
- **Content verification**: Verify entry authenticity via content hash
- **Privacy**: Only content hash is stored, not the actual content
- **User ownership**: Each entry is linked to Farcaster ID

Contract address: See `.env.local`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Farcaster](https://www.farcaster.xyz/)
- [Base](https://base.org/)
- [Turso](https://turso.tech/)
- [Netlify](https://www.netlify.com/)

## 💬 Support

For issues or questions:
- Open an issue on GitHub
- Contact via Farcaster: @yourhandle

---

Built with ❤️ for the Farcaster community
