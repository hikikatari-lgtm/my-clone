export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category?: string;
  series?: string;
  publishedAt?: string;
  summary?: string;
  charCount?: number;
  coverImage?: string;
  tags: string[];
}
