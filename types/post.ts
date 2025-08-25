// 🔄 This will be our main Post type
// Similar to Angular: export interface Post { ... }

export interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Relations
  author?: Profile;
  likes_count?: number;
  is_liked?: boolean;
  is_owner?: boolean; // Added for UI ownership checks
}

export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface Like {
  post_id: string;
  user_id: string;
  created_at: string;
}

// API Response types
export interface PostsResponse {
  posts: Post[];
  next_cursor?: string;
  has_more: boolean;
}
