/**
 * Seed Data Utility
 * Seeds initial menu data to Firestore if the collection is empty
 */

import { seedMenuDataIfEmpty } from '../firebase';
import type { MenuCategory, AggregatorId } from '../../types';

// Initial menu data based on the existing MENU_DATA in constants.tsx
// This will be used to seed Firestore if empty
// Later, you can parse the CSV file and add more items

interface SeedItem {
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
}

const INITIAL_MENU_DATA: SeedItem[] = [
  {
    nameAr: 'سان سيباستيان',
    nameEn: 'San Sebastian',
    descriptionAr: 'تشيز كيك باسكي فاخر بطبقة كراميل مثالية وقوام كريمي ذائب',
    descriptionEn: 'A luxurious Basque-style cheesecake with a perfectly caramelized top and creamy, melt-in-mouth texture',
    category: 'cake',
    basePrice: 25,
    deliveryPrice: 29,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: true,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta', 'ninja'],
  },
  {
    nameAr: 'كيكة الليمون والتوت',
    nameEn: 'Lemon & Berry Cake',
    descriptionAr: 'كيكة منعشة بنكهة الليمون الحامض مع توت طازج',
    descriptionEn: 'A refreshing cake with zesty lemon flavor topped with fresh berries',
    category: 'cake',
    basePrice: 22,
    deliveryPrice: 25,
    imageUrl: '',
    isAvailable: true,
    isNew: true,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta'],
  },
  {
    nameAr: 'تارت التوت',
    nameEn: 'Raspberry Tart',
    descriptionAr: 'تارت مقرمشة محشوة بكريمة الفانيلا وتوت طازج',
    descriptionEn: 'Crispy tart filled with vanilla cream and fresh raspberries',
    category: 'cake',
    basePrice: 20,
    deliveryPrice: 24,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta', 'ninja'],
  },
  {
    nameAr: 'ليدي فينجر تشوكليت فيليتين',
    nameEn: 'Lady Finger Chocolate Feuilletine',
    descriptionAr: 'طبقات من البسكويت الهش مع شوكولاتة بلجيكية فاخرة',
    descriptionEn: 'Layers of crispy biscuit with premium Belgian chocolate',
    category: 'cake',
    basePrice: 22,
    deliveryPrice: 25,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: true,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation'],
  },
  {
    nameAr: 'تيراميسو',
    nameEn: 'Tiramisu',
    descriptionAr: 'حلوى إيطالية كلاسيكية بالماسكاربوني والقهوة',
    descriptionEn: 'Classic Italian dessert with mascarpone and espresso',
    category: 'cake',
    basePrice: 20,
    deliveryPrice: 24,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta', 'ninja'],
  },
  {
    nameAr: 'بوكس ميني شو',
    nameEn: 'Mini Choux Box',
    descriptionAr: 'مجموعة من الشو المحشو بكريمات متنوعة',
    descriptionEn: 'Assorted mini choux pastries with various cream fillings',
    category: 'box',
    basePrice: 22,
    deliveryPrice: 25,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta'],
  },
  {
    nameAr: 'شاي حبق مثلج',
    nameEn: 'Iced Habaq Tea',
    descriptionAr: 'شاي منعش بالحبق المثلج',
    descriptionEn: 'Refreshing iced basil tea',
    category: 'drink',
    basePrice: 18,
    deliveryPrice: 22,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: true,
    isPreRequestOnly: false,
    availableOn: ['jahez'],
  },
  {
    nameAr: 'كركديه',
    nameEn: 'Karkade (Hibiscus)',
    descriptionAr: 'مشروب الكركديه المنعش',
    descriptionEn: 'Refreshing hibiscus drink',
    category: 'drink',
    basePrice: 14,
    deliveryPrice: 16,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta', 'ninja'],
  },
  {
    nameAr: 'أيس أمريكانو',
    nameEn: 'Iced Americano',
    descriptionAr: 'قهوة أمريكانو مثلجة',
    descriptionEn: 'Classic iced americano coffee',
    category: 'drink',
    basePrice: 11,
    deliveryPrice: 13,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta', 'ninja'],
  },
  {
    nameAr: 'أيس لاتيه',
    nameEn: 'Iced Latte',
    descriptionAr: 'لاتيه مثلج كريمي',
    descriptionEn: 'Creamy iced latte',
    category: 'drink',
    basePrice: 15,
    deliveryPrice: 18,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta', 'ninja'],
  },
  {
    nameAr: 'سبانش لاتيه',
    nameEn: 'Spanish Latte',
    descriptionAr: 'لاتيه إسباني بالحليب المكثف',
    descriptionEn: 'Spanish latte with condensed milk',
    category: 'drink',
    basePrice: 22,
    deliveryPrice: 26,
    imageUrl: '',
    isAvailable: true,
    isNew: true,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta'],
  },
];

/**
 * Seed the Firestore database with initial menu data
 * This function should be called once on app initialization
 */
export async function seedDatabase(): Promise<boolean> {
  try {
    const seeded = await seedMenuDataIfEmpty(INITIAL_MENU_DATA);
    return seeded;
  } catch (error) {
    console.error('Failed to seed database:', error);
    return false;
  }
}

/**
 * Parse CSV data and convert to menu items
 * Use this function when you have the CSV file ready
 */
export function parseCSVToMenuItems(csvContent: string): SeedItem[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const items: SeedItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Map CSV columns to menu item structure
    // Adjust these mappings based on your actual CSV column names
    const item: SeedItem = {
      nameEn: row['Name (EN)'] || row['name_en'] || row['Name'] || '',
      nameAr: row['Name (AR)'] || row['name_ar'] || '',
      descriptionEn: row['Description (EN)'] || row['description_en'] || '',
      descriptionAr: row['Description (AR)'] || row['description_ar'] || '',
      category: (row['Category'] || 'other').toLowerCase() as MenuCategory,
      basePrice: parseFloat(row['Base Price'] || row['Price'] || '0'),
      deliveryPrice: parseFloat(row['Delivery Price'] || row['delivery_price'] || '0'),
      imageUrl: row['Image URL'] || row['image_url'] || '',
      isAvailable: row['Available'] !== 'false' && row['Available'] !== '0',
      isNew: row['New'] === 'true' || row['New'] === '1',
      isBestSeller: row['Best Seller'] === 'true' || row['Best Seller'] === '1',
      isStoreExclusive: row['Store Exclusive'] === 'true' || row['Store Exclusive'] === '1',
      isPreRequestOnly: row['Pre-request Only'] === 'true' || row['Pre-request Only'] === '1',
      availableOn: parseAggregators(row['Available On'] || 'jahez,hungerstation,keeta,ninja'),
    };
    
    if (item.nameEn) {
      items.push(item);
    }
  }
  
  return items;
}

function parseAggregators(value: string): AggregatorId[] {
  const validAggregators: AggregatorId[] = ['jahez', 'hungerstation', 'keeta', 'ninja'];
  return value
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(s => validAggregators.includes(s as AggregatorId)) as AggregatorId[];
}

export default seedDatabase;

