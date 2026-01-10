/**
 * Firebase Configuration for AJDEL
 * Includes Firestore, Storage, and Analytics
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration for AJDEL
const firebaseConfig = {
  apiKey: "AIzaSyAV15owauNmTmZDXChQ4iLq_U901L5T81k",
  authDomain: "ajdel26.firebaseapp.com",
  projectId: "ajdel26",
  storageBucket: "ajdel26.firebasestorage.app",
  messagingSenderId: "26187391598",
  appId: "1:26187391598:web:7a80e347e68bf0e569fc7f",
  measurementId: "G-4LSZY3EQV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
export const initAnalytics = async () => {
  const supported = await isSupported();
  if (supported) {
    return getAnalytics(app);
  }
  return null;
};

// Collection references
export const menuItemsCollection = collection(db, 'menuItems');

// ============================================
// MENU ITEMS OPERATIONS
// ============================================

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
  availableOn: string[]; // ['jahez', 'hungerstation', 'keeta', 'ninja']
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Fetch all menu items from Firestore
 */
export async function getMenuItems(): Promise<FirestoreMenuItem[]> {
  try {
    const q = query(menuItemsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreMenuItem[];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

/**
 * Add or update a menu item
 */
export async function saveMenuItem(item: FirestoreMenuItem): Promise<void> {
  try {
    const docRef = doc(db, 'menuItems', item.id);
    await setDoc(docRef, {
      ...item,
      updatedAt: Date.now()
    });
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
    const docRef = doc(db, 'menuItems', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });
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
    const docRef = doc(db, 'menuItems', id);
    await updateDoc(docRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// ============================================
// STORAGE OPERATIONS
// ============================================

/**
 * Upload an image to Firebase Storage
 * @param file - The file to upload
 * @param itemId - The menu item ID (used for naming)
 * @returns The download URL of the uploaded image
 */
export async function uploadMenuImage(file: File, itemId: string): Promise<string> {
  try {
    // Create a unique filename
    const extension = file.name.split('.').pop();
    const filename = `menu-items/${itemId}_${Date.now()}.${extension}`;
    const storageRef = ref(storage, filename);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// ============================================
// SEED DATA FUNCTION
// ============================================

/**
 * Seed initial menu data if the collection is empty
 * Call this once on app initialization
 */
export async function seedMenuDataIfEmpty(initialData: Omit<FirestoreMenuItem, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>[]): Promise<boolean> {
  try {
    const snapshot = await getDocs(menuItemsCollection);
    
    if (snapshot.empty) {
      console.log('Seeding menu data...');
      const now = Date.now();
      
      for (let i = 0; i < initialData.length; i++) {
        const item = initialData[i];
        const id = `item_${i + 1}_${now}`;
        await setDoc(doc(db, 'menuItems', id), {
          ...item,
          id,
          viewCount: 0,
          createdAt: now,
          updatedAt: now
        });
      }
      
      console.log('Menu data seeded successfully!');
      return true;
    }
    
    console.log('Menu data already exists, skipping seed.');
    return false;
  } catch (error) {
    console.error('Error seeding menu data:', error);
    return false;
  }
}

// Default export
export default app;

