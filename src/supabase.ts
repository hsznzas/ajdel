/**
 * Supabase Configuration for AJDEL
 * Includes Database operations and Storage for images
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://aivjvckzzmjfcqubntxh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdmp2Y2t6em1qZmNxdWJudHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTc2MTMsImV4cCI6MjA4MzYzMzYxM30.tsP6oQWTOFBjfWkFdJGPxACJFSzQkkTIwLZAgwBuV2M';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TYPES
// ============================================

export interface MenuItem {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  category: 'cake' | 'drink' | 'box' | 'other';
  base_price: number;
  delivery_price: number;
  image_url: string;
  is_available: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_store_exclusive: boolean;
  is_pre_request_only: boolean;
  available_on: string[];
  view_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Legacy interface for compatibility with existing components
export interface FirestoreMenuItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'cake' | 'drink' | 'box' | 'other';
  basePrice: number;
  deliveryPrice: number;
  imageUrl: string;
  isAvailable: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isStoreExclusive: boolean;
  isPreRequestOnly: boolean;
  availableOn: string[];
  viewCount: number;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// URL HELPERS
// ============================================

/**
 * Convert Google Drive sharing URLs to direct image URLs
 * Supports various Google Drive URL formats
 */
export function convertToDirectImageUrl(url: string): string {
  if (!url) return url;
  
  // Already a direct URL or not a Google Drive URL
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return url;
  }
  
  // Extract file ID from various Google Drive URL formats
  let fileId: string | null = null;
  
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!fileId && openMatch) {
    fileId = openMatch[1];
  }
  
  // Format: https://docs.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (!fileId && ucMatch) {
    fileId = ucMatch[1];
  }
  
  if (fileId) {
    // Return direct download URL
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Return original URL if we couldn't parse it
  return url;
}

// ============================================
// CONVERTERS
// ============================================

// Convert Supabase row to app format
function toAppFormat(row: MenuItem): FirestoreMenuItem {
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    descriptionAr: row.description_ar,
    descriptionEn: row.description_en,
    category: row.category,
    basePrice: Number(row.base_price),
    deliveryPrice: Number(row.delivery_price),
    imageUrl: row.image_url,
    isAvailable: row.is_available,
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    isStoreExclusive: row.is_store_exclusive,
    isPreRequestOnly: row.is_pre_request_only,
    availableOn: row.available_on || [],
    viewCount: row.view_count,
    sortOrder: row.sort_order || 0,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

// Convert app format to Supabase row
function toDbFormat(item: FirestoreMenuItem): Partial<MenuItem> {
  return {
    id: item.id,
    name_ar: item.nameAr,
    name_en: item.nameEn,
    description_ar: item.descriptionAr,
    description_en: item.descriptionEn,
    category: item.category,
    base_price: item.basePrice,
    delivery_price: item.deliveryPrice,
    image_url: item.imageUrl,
    is_available: item.isAvailable,
    is_new: item.isNew,
    is_best_seller: item.isBestSeller,
    is_store_exclusive: item.isStoreExclusive,
    is_pre_request_only: item.isPreRequestOnly,
    available_on: item.availableOn,
    view_count: item.viewCount,
    sort_order: item.sortOrder,
  };
}

// ============================================
// MENU ITEMS OPERATIONS
// ============================================

/**
 * Fetch all menu items from Supabase
 */
export async function getMenuItems(): Promise<FirestoreMenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(toAppFormat);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

/**
 * Save (insert or update) a menu item
 */
export async function saveMenuItem(item: FirestoreMenuItem): Promise<void> {
  try {
    const dbItem = toDbFormat(item);
    
    const { error } = await supabase
      .from('menu_items')
      .upsert(dbItem, { onConflict: 'id' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving menu item:', error);
    throw error;
  }
}

/**
 * Update specific fields of a menu item
 */
export async function updateMenuItem(id: string, updates: Partial<FirestoreMenuItem>): Promise<void> {
  try {
    // Convert camelCase to snake_case for the updates
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.descriptionAr !== undefined) dbUpdates.description_ar = updates.descriptionAr;
    if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.basePrice !== undefined) dbUpdates.base_price = updates.basePrice;
    if (updates.deliveryPrice !== undefined) dbUpdates.delivery_price = updates.deliveryPrice;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
    if (updates.isBestSeller !== undefined) dbUpdates.is_best_seller = updates.isBestSeller;
    if (updates.isStoreExclusive !== undefined) dbUpdates.is_store_exclusive = updates.isStoreExclusive;
    if (updates.isPreRequestOnly !== undefined) dbUpdates.is_pre_request_only = updates.isPreRequestOnly;
    if (updates.availableOn !== undefined) dbUpdates.available_on = updates.availableOn;
    
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('menu_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
}

/**
 * Increment view count for a menu item
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_view_count', { item_id: id });
    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
}

/**
 * Update sort order for multiple menu items
 * @param items - Array of { id, sortOrder } objects
 */
export async function updateSortOrders(items: { id: string; sortOrder: number }[]): Promise<void> {
  try {
    // Update each item's sort_order
    const updates = items.map(item => 
      supabase
        .from('menu_items')
        .update({ sort_order: item.sortOrder, updated_at: new Date().toISOString() })
        .eq('id', item.id)
    );
    
    await Promise.all(updates);
  } catch (error) {
    console.error('Error updating sort orders:', error);
    throw error;
  }
}

// ============================================
// STORAGE OPERATIONS
// ============================================

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param itemId - The menu item ID (used for naming)
 * @returns The public URL of the uploaded image
 */
export async function uploadMenuImage(file: File, itemId: string): Promise<string> {
  try {
    // Create a unique filename
    const extension = file.name.split('.').pop();
    const filename = `${itemId}_${Date.now()}.${extension}`;
    const filePath = `${filename}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteMenuImage(imageUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('menu-images')
      .remove([filename]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// ============================================
// SEED DATA (for initial setup)
// ============================================

export async function seedMenuDataIfEmpty(): Promise<boolean> {
  try {
    // Check if any items exist
    const { data, error } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);

    if (error) throw error;

    // If items exist, don't seed
    if (data && data.length > 0) {
      console.log('Menu data already exists, skipping seed.');
      return false;
    }

    console.log('Database is empty. Add items through the admin portal.');
    return false;
  } catch (error) {
    console.error('Error checking menu data:', error);
    return false;
  }
}

// ============================================
// LOCATION CLICK TRACKING (Internal only, no TikTok Pixel)
// ============================================

const LOCATION_CLICKS_KEY = 'ajdel_location_clicks';

/**
 * Increment location button click count (stored in localStorage)
 */
export function incrementLocationClicks(): void {
  try {
    const current = getLocationClicks();
    localStorage.setItem(LOCATION_CLICKS_KEY, String(current + 1));
  } catch (error) {
    console.error('Error incrementing location clicks:', error);
  }
}

/**
 * Get the total location button click count
 */
export function getLocationClicks(): number {
  try {
    const stored = localStorage.getItem(LOCATION_CLICKS_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.error('Error getting location clicks:', error);
    return 0;
  }
}

// ============================================
// SITE SETTINGS (Stored in Supabase for cross-browser sync)
// ============================================

export interface AggregatorSettings {
  jahez: boolean;
  hungerstation: boolean;
  keeta: boolean;
  ninja: boolean;
}

const DEFAULT_AGGREGATOR_SETTINGS: AggregatorSettings = {
  jahez: true,
  hungerstation: true,
  keeta: true,
  ninja: true,
};

/**
 * Get aggregator visibility settings from Supabase
 * Falls back to defaults if not found
 */
export async function getAggregatorSettingsFromDB(): Promise<AggregatorSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'aggregator_visibility')
      .single();

    if (error || !data) {
      // If no settings exist yet, return defaults
      return DEFAULT_AGGREGATOR_SETTINGS;
    }

    return { ...DEFAULT_AGGREGATOR_SETTINGS, ...data.value };
  } catch (error) {
    console.error('Error fetching aggregator settings:', error);
    return DEFAULT_AGGREGATOR_SETTINGS;
  }
}

/**
 * Save aggregator visibility settings to Supabase
 */
export async function saveAggregatorSettingsToDB(settings: AggregatorSettings): Promise<void> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'aggregator_visibility',
        value: settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving aggregator settings:', error);
    throw error;
  }
}

export default supabase;

