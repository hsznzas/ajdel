/**
 * TikTok Pixel Events API Utility
 * Provides typed helper functions for tracking TikTok Pixel events
 */

// Extend Window interface to include ttq
declare global {
  interface Window {
    ttq?: TikTokPixel;
  }
}

interface TikTokPixel {
  track: (eventName: string, parameters?: Record<string, unknown>) => void;
  identify: (userData: TikTokUserData) => void;
  page: () => void;
}

// User identification data (must be SHA-256 hashed on client side)
export interface TikTokUserData {
  email?: string;        // SHA-256 hashed email
  phone_number?: string; // SHA-256 hashed phone number
  external_id?: string;  // SHA-256 hashed external ID
}

// Content item for tracking
export interface TikTokContent {
  content_id: string;      // ID of the product/content
  content_type: 'product' | 'product_group';
  content_name: string;    // Name of the page or product
}

// Event parameters interfaces
export interface ViewContentParams {
  contents: TikTokContent[];
}

export interface AddToWishlistParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
}

export interface SearchParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
  search_string?: string;
}

export interface AddPaymentInfoParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
}

export interface AddToCartParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
}

export interface InitiateCheckoutParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
}

export interface PlaceAnOrderParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
}

export interface CompleteRegistrationParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
}

export interface PurchaseParams {
  contents: TikTokContent[];
  value?: number;
  currency?: string;
}

/**
 * SHA-256 hash function for PII data
 * Use this to hash email, phone, or external_id before sending to TikTok
 */
export async function sha256Hash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the TikTok Pixel instance
 */
function getTTQ(): TikTokPixel | null {
  if (typeof window !== 'undefined' && window.ttq) {
    return window.ttq;
  }
  console.warn('TikTok Pixel (ttq) not found. Make sure the pixel is loaded.');
  return null;
}

/**
 * Identify user with hashed PII data
 * Call this before tracking events when you have user data
 */
export function ttqIdentify(userData: TikTokUserData): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.identify(userData);
  }
}

/**
 * Track page view
 */
export function ttqPage(): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.page();
  }
}

/**
 * Track ViewContent event
 * Use when a user views content (product page, landing page, etc.)
 */
export function ttqViewContent(params: ViewContentParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('ViewContent', params);
  }
}

/**
 * Track AddToWishlist event
 */
export function ttqAddToWishlist(params: AddToWishlistParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('AddToWishlist', params);
  }
}

/**
 * Track Search event
 */
export function ttqSearch(params: SearchParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('Search', params);
  }
}

/**
 * Track AddPaymentInfo event
 */
export function ttqAddPaymentInfo(params: AddPaymentInfoParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('AddPaymentInfo', params);
  }
}

/**
 * Track AddToCart event
 */
export function ttqAddToCart(params: AddToCartParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('AddToCart', params);
  }
}

/**
 * Track InitiateCheckout event
 */
export function ttqInitiateCheckout(params: InitiateCheckoutParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('InitiateCheckout', params);
  }
}

/**
 * Track PlaceAnOrder event
 */
export function ttqPlaceAnOrder(params: PlaceAnOrderParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('PlaceAnOrder', params);
  }
}

/**
 * Track CompleteRegistration event
 */
export function ttqCompleteRegistration(params: CompleteRegistrationParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('CompleteRegistration', params);
  }
}

/**
 * Track Purchase event
 */
export function ttqPurchase(params: PurchaseParams): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track('Purchase', params);
  }
}

/**
 * Track custom event
 */
export function ttqTrackCustom(eventName: string, params?: Record<string, unknown>): void {
  const ttq = getTTQ();
  if (ttq) {
    ttq.track(eventName, params);
  }
}

// ============================================
// AJDEL-SPECIFIC TRACKING HELPERS
// ============================================

/**
 * Track when user views the homepage
 */
export function trackHomepageView(): void {
  ttqViewContent({
    contents: [{
      content_id: 'ajdel_homepage',
      content_type: 'product_group',
      content_name: 'AJDEL Homepage'
    }]
  });
}

/**
 * Track when user views the menu
 */
export function trackMenuView(): void {
  ttqViewContent({
    contents: [{
      content_id: 'ajdel_menu',
      content_type: 'product_group',
      content_name: 'AJDEL Digital Menu'
    }]
  });
}

/**
 * Track when user clicks on a delivery platform link
 * This indicates high purchase intent
 */
export function trackDeliveryLinkClick(platformId: string, platformName: string): void {
  ttqInitiateCheckout({
    contents: [{
      content_id: `delivery_${platformId}`,
      content_type: 'product_group',
      content_name: `Order via ${platformName}`
    }],
    currency: 'SAR'
  });
}

/**
 * Track when user clicks on location link
 */
export function trackLocationClick(): void {
  ttqTrackCustom('ClickButton', {
    contents: [{
      content_id: 'location',
      content_type: 'product',
      content_name: 'View Location'
    }]
  });
}

