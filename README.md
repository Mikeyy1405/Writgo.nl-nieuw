<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Uk9EXmZ4f0n0Wpv7wQjMmNwuq9YPhjDC

## AI Features

This application uses **Claude 4.5 Sonnet** (claude-sonnet-4-20250514) from Anthropic for all AI-powered features:
- AI-generated product/course reviews
- AI-powered blog post generation
- AI search recommendations

## Database

The application supports two data storage modes:

### 1. Supabase (Recommended for Production)
When Supabase is configured, all data is stored in a PostgreSQL database with:
- Real-time synchronization across devices
- Persistent storage that survives cache clears
- Row-level security for authenticated operations
- Automatic timestamps and updates

### 2. LocalStorage (Fallback)
When Supabase is not configured, the app falls back to browser LocalStorage. This is suitable for:
- Local development
- Testing without a database
- Quick prototyping

## Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings -> API

### 2. Run Database Migrations
Execute the SQL files in order in your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql` - Creates tables and indexes
2. `supabase/migrations/002_rls_policies.sql` - Sets up Row Level Security

### 3. Configure Environment Variables
Create a `.env.local` file (use `.env.example` as template):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
CLAUDE_API_KEY=your_claude_api_key
```

### 4. Migrate Existing Data (Optional)
To migrate static sample data to Supabase, import and run the migration script:
```javascript
// In browser console or your code
import { runMigration } from './scripts/migrate-to-supabase';
runMigration();
```

## Database Schema

### Courses Table
Stores both courses (cursussen) and tools with fields for:
- Basic info (title, description, slug)
- Content type ('cursus' or 'tool')
- Pricing and ratings
- SEO metadata
- Rich review content
- Media (images, videos)
- FAQ and specifications

### Blog Posts Table
Stores blog articles with:
- Content and metadata
- SEO fields
- Publishing status and timestamps
- View counts and scores

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`

2. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Set `CLAUDE_API_KEY` to your Claude API key from Anthropic
   - (Optional) Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for database persistence

3. Run the app:
   `npm run dev`

## Project Structure

```
├── config/             # Configuration files
│   └── supabase.ts     # Supabase client configuration
├── services/           # Backend services
│   ├── db.ts           # Database service (Supabase + LocalStorage fallback)
│   ├── auth.ts         # Authentication service
│   └── claudeService.ts # AI service
├── components/         # React components
├── scripts/            # Utility scripts
│   └── migrate-to-supabase.ts # Data migration script
├── supabase/           # Supabase configuration
│   └── migrations/     # SQL migration files
├── types.ts            # TypeScript type definitions
├── database.ts         # Database type definitions
└── constants.ts        # Static sample data
```
