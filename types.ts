
export type Language = 'ar' | 'en';

export interface LinkItem {
  id: string;
  label: { ar: string; en: string };
  url: string;
  deepLink?: string;
  icon?: string;
  isInternal?: boolean;
}

export interface MenuItem {
  name: { ar: string; en: string };
  price: number;
  category?: 'cake' | 'drink' | 'box';
}

export type View = 'home' | 'menu';
