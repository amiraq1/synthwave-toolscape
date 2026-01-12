/**
 * 🎯 Central Type Definitions for نبض AI
 * All shared types should be imported from here
 */

// ============================================
// 🔧 Tool Types
// ============================================

export interface Tool {
    id: string;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    category: string;
    created_at?: string;
    updated_at?: string;
    secondary_categories?: string[];
    url: string;
    image_url: string | null;
    pricing_type: string;
    pricing_details?: PricingDetails | null;
    is_featured: boolean;
    is_published?: boolean;
    is_sponsored?: boolean;
    sponsor_expiry?: string | null;
    supports_arabic?: boolean;
    coupon_code?: string | null;
    deal_expiry?: string | null;
    features: string[] | null;
    screenshots?: string[] | null;
    average_rating?: number;
    reviews_count?: number;
    video_url?: string | null;
    faqs?: FAQ[] | null;
    alternatives?: string[] | null;
    tasks?: string[];
    arabic_score?: number;
    release_date?: string | null;
    clicks_count?: number;
    trending_score?: number;
    views_count?: number;
}

export interface PricingDetails {
    free?: { features: string[]; limits?: string };
    pro?: { price: string; features: string[]; billing?: string };
    enterprise?: { features: string[]; contact?: boolean };
}

export interface FAQ {
    question: string;
    answer: string;
}

// ============================================
// 👤 User & Profile Types
// ============================================

export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
    role?: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    bookmarks_count: number;
    reviews_count: number;
    tools_submitted: number;
}

// ============================================
// ⭐ Review Types
// ============================================

export interface Review {
    id: string;
    tool_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at?: string;
    user_name?: string;
    user_avatar?: string;
    tools?: { title: string } | null;
    profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface ReviewFormData {
    rating: number;
    comment: string;
}

// ============================================
// 🔖 Bookmark Types
// ============================================

export interface Bookmark {
    id: string;
    user_id: string;
    tool_id: string;
    created_at: string;
    tools?: Tool | null;
}

// ============================================
// 📝 Blog Types
// ============================================

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image?: string | null;
    author_id?: string;
    author_name?: string;
    category?: string;
    tags?: string[];
    published_at?: string;
    created_at: string;
    updated_at?: string;
    views_count?: number;
    is_published: boolean;
}

export interface BlogComment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
}

// ============================================
// 🤖 Agent Types
// ============================================

export interface Agent {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    author?: string;
    downloads?: number;
    rating?: number;
    tags?: string[];
    workflow_config?: WorkflowConfig;
    created_at?: string;
}

// ============================================
// 🔄 Workflow Types
// ============================================

export interface WorkflowConfig {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export interface WorkflowNode {
    id: string;
    type: 'input' | 'output' | 'tool' | 'ai' | 'condition' | 'transform';
    position: { x: number; y: number };
    data: WorkflowNodeData;
}

export interface WorkflowNodeData {
    label: string;
    type?: string;
    config?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

// ============================================
// 📊 Analytics Types
// ============================================

export interface ToolClick {
    tool_id: string;
    user_id?: string;
    timestamp: string;
    referrer?: string;
}

export interface SearchQuery {
    query: string;
    results_count: number;
    timestamp: string;
    user_id?: string;
}

// ============================================
// 🔔 Notification Types
// ============================================

export interface Notification {
    id: string;
    user_id: string;
    type: 'new_tool' | 'review_reply' | 'system' | 'promotion';
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

// ============================================
// 📧 Newsletter Types
// ============================================

export interface NewsletterSubscriber {
    id: string;
    email: string;
    subscribed_at: string;
    is_active: boolean;
}

// ============================================
// 🎨 UI Types
// ============================================

export type Category = 'الكل' | 'نصوص' | 'صور' | 'فيديو' | 'برمجة' | 'إنتاجية' | 'دراسة وطلاب' | 'صوت';

export type PersonaId = 'all' | 'design' | 'dev' | 'content' | 'student' | 'marketing' | 'business';

export interface Persona {
    id: PersonaId;
    label: string;
    icon: string;
    categories: string[];
}

// ============================================
// 🔐 Auth Types (re-exported from Supabase)
// ============================================

export type { User, Session, AuthError } from '@supabase/supabase-js';

// ============================================
// 📦 API Response Types
// ============================================

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
}

// ============================================
// 🛠️ Utility Types
// ============================================

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
