# Micro Feed

A tiny "micro feed" built with Next.js, TypeScript, and Supabase where authenticated users can create, search, like, and manage text posts.

## 🚀 Features

- **Authentication**: Sign up/in with email and password
- **Post Creation**: Create text posts up to 280 characters
- **Feed Management**: View paginated posts (newest first)
- **Search & Filter**: Search posts by keyword, filter by "All Posts" vs "My Posts"
- **Interactions**: Like/unlike posts with optimistic updates
- **Post Management**: Edit and delete your own posts
- **Responsive Design**: Beautiful dark theme UI

## 🛠 Setup Instructions

### 1. Environment Variables

Copy the environment template:

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Run the following schema (also available in `/docs/schema.sql`):

```sql
-- Create tables
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 280),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists likes (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- Enable RLS
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;

-- RLS Policies
create policy "read profiles" on profiles for select using (true);
create policy "upsert self profile" on profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "read posts" on posts for select using (true);
create policy "insert own posts" on posts for insert with check (auth.uid() = author_id);
create policy "update own posts" on posts for update using (auth.uid() = author_id);
create policy "delete own posts" on posts for delete using (auth.uid() = author_id);

create policy "read likes" on likes for select using (true);
create policy "like" on likes for insert with check (auth.uid() = user_id);
create policy "unlike" on likes for delete using (auth.uid() = user_id);
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Optional: Seed Data

After creating an account, you can create some test posts to explore the features.

## 🏗 Architecture & Design Decisions

### **Routing Choice: Direct Database Calls vs Server Actions**

**Decision**: I chose **direct database calls** from client components using Supabase's client-side SDK instead of server actions or API routes.

**Reasoning**:

- **Supabase-First Architecture**: Supabase's Row Level Security (RLS) handles all authorization at the database level, making server-side auth middleware redundant
- **Performance**: Eliminates unnecessary server round-trips - client talks directly to database
- **Real-time Ready**: Direct client connection enables easy future addition of real-time subscriptions
- **Type Safety**: End-to-end TypeScript from database to UI without serialization boundaries
- **Simplicity**: Fewer moving parts means less complexity and fewer potential failure points

**Why Not Server Actions?**

- Server Actions excel when you need server-side processing, complex business logic, or want to hide database structure
- For this project, RLS provides security, and CRUD operations are straightforward
- Adding a server layer would increase latency and complexity without meaningful benefits

**Industry Context**: This direct-client pattern is recommended by Supabase and widely used in production apps like Linear, Notion (for some operations), and many Y Combinator startups.

### **Error Handling Strategy**

- **Client-side**: React hooks manage error states with user-friendly messages
- **Optimistic Updates**: UI updates immediately with rollback on failures
- **Database Level**: RLS policies provide security guardrails
- **Validation**: Zod schemas validate data on both client and server

### **Optimistic UI Strategy**

- **Post Creation**: Immediately shows in feed, removes on error
- **Like/Unlike**: Instant count update with server sync
- **State Management**: Map-based optimistic updates with automatic cleanup

### **RLS Security Assumptions**

- Users can only modify their own posts and profiles
- All posts and profiles are publicly readable
- Like/unlike operations are restricted to authenticated users
- Database-level constraints prevent unauthorized access

## ⚡ Development Features

- **Git Hooks**: Pre-commit type checking, linting, and formatting
- **Code Quality**: ESLint, Prettier, and Commitlint configuration
- **TypeScript**: Strict type checking throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🎯 Tradeoffs & Timeboxing

### **What's Included**

- Full CRUD operations for posts
- Beautiful, responsive UI with dark theme
- Real-time like counting with optimistic updates
- Robust error handling and loading states
- Comprehensive TypeScript types
- Professional development tooling

### **What Was Prioritized**

- **User Experience**: Smooth interactions with optimistic updates over complex animations
- **Code Quality**: Proper separation of concerns and type safety over advanced features
- **Security**: RLS-first approach over custom authorization middleware
- **Performance**: Client-side filtering for non-paginated mode over full server-side search

### **Future Enhancements** (out of scope)

- Real-time feed updates with Supabase subscriptions
- Image uploads for posts
- User profiles with avatars
- Comment system
- Push notifications
- Advanced search with full-text indexing

## 📁 Project Structure

```
app/                    # Next.js app router
  layout.tsx           # Root layout
  page.tsx             # Main feed page
components/            # Reusable UI components
  auth-form.tsx        # Authentication form
  composer.tsx         # Post creation
  post-card.tsx        # Individual post display
  toolbar.tsx          # Navigation toolbar
  filter-tabs.tsx      # All/Mine post filters
  pagination.tsx       # Pagination controls
hooks/                 # Custom React hooks
  use-auth.ts          # Authentication state
  use-posts.ts         # Non-paginated posts
  use-posts-paginated.ts # Paginated posts with filters
  use-post-counts.ts   # Post counting
lib/                   # Shared utilities
  db.ts                # Supabase client & database functions
  auth.ts              # Authentication helpers
  validators.ts        # Zod validation schemas
  pagination.ts        # Pagination utilities
types/                 # TypeScript type definitions
  post.ts              # Post and related types
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

---
