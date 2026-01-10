
export type Language = 'ar' | 'en';

export interface LinkItem {
  id: string;
  label: { ar: string; en: string };
  url: string;
  deepLink?: string;
  icon?: string;
  isInternal?: boolean;
}

// Legacy menu item (for static data)
export interface MenuItem {
  name: { ar: string; en: string };
  price: number;
  category?: 'cake' | 'drink' | 'box';
}

export type View = 'home' | 'menu';

// ============================================
// FIRESTORE MENU ITEM TYPES
// ============================================

export type MenuCategory = 'cake' | 'drink' | 'box' | 'other';

export type AggregatorId = 'jahez' | 'hungerstation' | 'keeta' | 'ninja';

export interface FirestoreMenuItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: MenuCategory;
  basePrice: number;
  deliveryPrice: number;
  imageUrl: string;
  isAvailable: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isStoreExclusive: boolean;
  isPreRequestOnly: boolean;
  availableOn: AggregatorId[];
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}

// Aggregator information for display
export interface AggregatorInfo {
  id: AggregatorId;
  nameAr: string;
  nameEn: string;
  logo: string;
  color: string;
}

// Admin portal types
export interface AdminUser {
  isAuthenticated: boolean;
}

// Analytics types
export interface MenuItemAnalytics {
  itemId: string;
  itemName: string;
  viewCount: number;
}
