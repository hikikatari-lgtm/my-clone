export interface CourseCard {
  id: string;
  title: string;
  author: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
}

export interface Artist {
  name: string;
  image: string;
  alt: string;
}

export interface TabItem {
  label: string;
  value: string;
}

export interface SkillLevelCard {
  icon: "star" | "trending" | "trophy";
  title: string;
  description: string;
}

export interface GenreCard {
  name: string;
}

export interface InstrumentCard {
  name: string;
  image: string;
}

export interface LearningPathCard {
  name: string;
  description: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface NavItem {
  label: string;
  href?: string;
  hasDropdown?: boolean;
}
