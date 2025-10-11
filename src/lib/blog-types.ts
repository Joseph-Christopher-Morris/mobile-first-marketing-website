export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  readTime: number;
  featured?: boolean;
}

export interface BlogCategory {
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface BlogTag {
  name: string;
  slug: string;
  count: number;
}
