export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  featured?: boolean;
  image?: string;
  readTime?: number;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  featured?: boolean;
  image?: string;
  readTime?: number;
}
