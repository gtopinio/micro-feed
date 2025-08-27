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
3. Run the following schema to create necessary tables and RLS policies:

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

After creating a user account, you can add sample posts via the SQL editor:

```sql
-- Replace 'your-user-id' with your actual user ID from auth.users table
INSERT INTO posts (content, author_id) VALUES
('Just built my first micro feed! 🚀 #coding #nextjs', 'your-user-id'),
('TypeScript + Supabase = ❤️ Perfect combo for rapid development', 'your-user-id'),
('Working on pagination features. The user experience is so smooth! ✨', 'your-user-id');
```

## 🏗 Architecture & Design Decisions

I chose to use direct database calls via the Supabase client rather than server actions or API routes. Supabase’s Row Level Security enforces all permissions at the database level, so adding another server layer would introduce complexity and latency without meaningful benefits for this project. This pattern also keeps the app real-time ready, reduces round trips, and keeps type safety end-to-end.

For correctness and security, validation is done with Zod on the client, while RLS policies and database constraints act as the server-side guardrails. Error handling is centralized in hooks with friendly UI feedback, and optimistic UI ensures fast interactions: posts and likes update immediately with rollback on failure. In short, the design favors simplicity, responsiveness, and RLS-first security over unnecessary backend layers.

### **Tradeoffs & Timeboxing**

#### What's Included

- Full CRUD operations for posts
- Beautiful, responsive UI with dark theme
- Real-time like counting with optimistic updates
- Robust error handling and loading states
- Comprehensive TypeScript types
- Professional development tooling

#### What Was Prioritized

- **User Experience**: Smooth interactions with optimistic updates over complex animations
- **Code Quality**: Proper separation of concerns and type safety over advanced features
- **Security**: RLS-first approach over custom authorization middleware
- **Performance**: Client-side filtering for non-paginated mode over full server-side search
- **Routing Choice**: Direct client calls were prioritized over server actions/API routes to reduce complexity and leverage Supabase RLS for security. Server actions could be added later if server-side logic or hidden business rules become necessary.

#### Future Enhancements (out of scope)

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
