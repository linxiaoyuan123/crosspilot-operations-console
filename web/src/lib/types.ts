export type Article = {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string;
  excerpt: string;
  content_md: string;
  cover_image: string;
  status: 'draft' | 'published';
  featured: boolean | number;
  views: number;
  reading_minutes: number;
  created_at: string;
  updated_at: string;
  html?: string;
  comment_count?: number;
  relationships?: ArticleRelationships;
};

export type ArticleStats = {
  total: number;
  published: number;
  drafts: number;
  views: number;
  characters: number;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  series: TaxonomyItem[];
  comments: {
    total: number;
    pending: number;
    approved: number;
  };
};

export type TaxonomyItem = {
  name: string;
  slug: string;
  count: number;
  description?: string;
};

export type CommentItem = {
  id: number;
  article_id: number;
  parent_id: number | null;
  nickname: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  replies: CommentItem[];
};

export type ContentEntry = {
  id: number;
  type: string;
  slug: string;
  title: string;
  summary: string;
  content_md: string;
  cover_image: string;
  metadata: Record<string, unknown>;
  status: 'draft' | 'published';
  featured: boolean;
  published_at: string;
  updated_at: string;
  html?: string;
};

export type ArticleRelationships = {
  series: null | {
    id: number;
    name: string;
    slug: string;
    description: string;
    order: number;
  };
  prev: null | { id: number; slug: string; title: string };
  next: null | { id: number; slug: string; title: string };
  previous: null | { id: number; slug: string; title: string };
  nextArticle: null | { id: number; slug: string; title: string };
  related: Article[];
  random: Article[];
};

export type Store = {
  id: number;
  name: string;
  platform: string;
  market: string;
  currency: string;
  code?: string;
  target_acos?: number;
  target_margin?: number;
  lead_time_days?: number;
  health_status?: string;
  health_rating?: number;
  order_defect_rate?: number;
  health_metrics?: Array<{ key: string; status: string }>;
};

export type Overview = {
  store: Store & {
    target_acos: number;
  };
  kpis: {
    netSales: number;
    profit: number;
    acos: number;
    inventoryRiskCount: number;
    pendingAfterSales: number;
  };
  actionsPreview: Array<{
    id: number;
    title: string;
    category: string;
    priority: string;
    status: string;
    description?: string;
  }>;
};
