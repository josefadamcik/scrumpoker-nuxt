# Scrum Poker - Planning Poker for Agile Teams

A serverless, real-time planning poker application built with Nuxt, Vue, TypeScript, Supabase, and deployed on Vercel.

## Features

- **Real-time Updates**: Instant synchronization using Supabase WebSocket
- **No Registration**: Start estimating immediately with shareable links
- **Team Collaboration**: Support for up to 50 participants per session
- **Privacy-Focused**: No accounts required, sessions auto-expire after 24 hours
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: Supabase Real-Time (WebSocket)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Vercel account (free tier)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scrumpoker-nuxt
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the migration script in `supabase/migrations/20250101000000_initial_schema.sql`
   - Get your project URL and API keys from Project Settings > API

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
scrumpoker-nuxt/
├── assets/           # Static assets and CSS
├── components/       # Vue components
│   ├── VoteCard.vue
│   ├── ParticipantList.vue
│   ├── Statistics.vue
│   ├── LoadingState.vue
│   └── ErrorState.vue
├── composables/      # Vue composables
│   ├── useRealtime.ts
│   ├── usePresence.ts
│   ├── useParticipant.ts
│   └── useSupabase.ts
├── pages/            # Application pages
│   ├── index.vue     # Home page
│   └── session/
│       └── [id].vue  # Session page
├── plugins/          # Nuxt plugins
│   └── supabase.client.ts
├── server/           # Server-side code
│   ├── api/          # API routes
│   │   └── session/
│   │       ├── index.post.ts      # Create session
│   │       └── [id]/
│   │           ├── index.get.ts   # Get session
│   │           ├── join.post.ts   # Join session
│   │           ├── vote.post.ts   # Submit vote
│   │           ├── reveal.post.ts # Reveal votes
│   │           └── reset.post.ts  # Reset round
│   └── utils/        # Server utilities
│       └── supabase.ts
├── supabase/         # Database migrations
│   └── migrations/
├── types/            # TypeScript types
│   ├── index.ts
│   └── database.ts
└── utils/            # Utility functions
    ├── ids.ts
    ├── nicknames.ts
    ├── validation.ts
    └── botDetection.ts
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import the project in Vercel

3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy!

The application will be automatically deployed to Vercel with each push to your repository.

### Database Maintenance

To clean up expired sessions, you can set up a scheduled task (cron job) to run:

```sql
SELECT delete_expired_sessions();
```

This can be configured in Supabase under Database > Functions or using a service like Vercel Cron Jobs.

## Usage

### Creating a Session

1. Visit the home page
2. Optionally enter a nickname (or get a random one)
3. Click "Create Session"
4. Share the generated URL with your team

### Joining a Session

1. Click on the shared session link
2. Optionally enter a nickname
3. Start voting!

### Voting

1. Select a card from the available options (0, 1, 2, 3, 5, 8, 13, 21, ?, ☕)
2. You can change your vote before the host reveals
3. Other participants see that you've voted but not your actual vote

### Revealing Votes

1. Only the session creator (host) can reveal votes
2. Click "Reveal Votes" to show all votes
3. View statistics including average, min, max, and consensus

### Starting a New Round

1. After votes are revealed, the host can click "New Round"
2. All votes are cleared and a new round begins

## API Routes

### POST /api/session
Create a new session
- Body: `{ nickname?: string }`
- Returns: `{ sessionId, participantId, nickname }`

### POST /api/session/[id]/join
Join an existing session
- Body: `{ nickname?: string }`
- Returns: `{ participantId, nickname, session }`

### GET /api/session/[id]
Get session details
- Returns: `Session` object

### POST /api/session/[id]/vote
Submit a vote
- Body: `{ participantId: string, vote: Card }`
- Returns: `{ success: true }`

### POST /api/session/[id]/reveal
Reveal all votes (host only)
- Body: `{ participantId: string }`
- Returns: `{ success: true }`

### POST /api/session/[id]/reset
Reset round (host only)
- Body: `{ participantId: string }`
- Returns: `{ success: true }`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
