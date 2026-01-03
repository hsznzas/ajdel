import React from 'react';
import { LinkItem, MenuItem } from './types';

export interface ExtendedLinkItem extends LinkItem {
  shimmerClass: string;
}

export const LINKS: ExtendedLinkItem[] = [
  { id: 'hunger', label: { ar: 'هنقرستيشن', en: 'HungerStation' }, url: 'https://hungerstation.com/sa-en/restaurant/riyadh/malqa/156422', shimmerClass: 'btn-hunger' },
  { id: 'jahez', label: { ar: 'جاهز', en: 'Jahez' }, url: 'https://jahez.link/nDKd7jk0QUb', shimmerClass: 'btn-jahez' },
  { id: 'chefz', label: { ar: 'ذا شيفز', en: 'The Chefz' }, url: 'https://url.mykeeta.com/WCjnfSYz', shimmerClass: 'btn-chefz' },
  { id: 'ninja', label: { ar: 'نينجا', en: 'Ninja' }, url: 'https://ananinja.com/sa/ar/restaurants/ajdel-41829', shimmerClass: 'btn-ninja' },
  { id: 'salla', label: { ar: 'سلة (متجر إلكتروني)', en: 'Salla (E-commerce)' }, url: 'http://salla.sa/ajdels', shimmerClass: 'btn-salla' },
  { id: 'menu', label: { ar: 'قائمة الطعام', en: 'Digital Menu' }, url: '#menu', isInternal: true, shimmerClass: 'btn-standard' },
  { id: 'location', label: { ar: 'الموقع', en: 'Location' }, url: 'https://maps.app.goo.gl/8E4gu42aSGkqY8X2A', shimmerClass: 'btn-standard' },
];

export const MENU_DATA: MenuItem[] = [
  { name: { ar: 'سان سيباستيان', en: 'San Sebastian' }, price: 29 },
  { name: { ar: 'كيكة الليمون والتوت', en: 'Lemon & Berry Cake' }, price: 25 },
  { name: { ar: 'تارت التوت', en: 'Raspberry Tart' }, price: 24 },
  { name: { ar: 'ليدي فينجر تشوكليت فيليتين', en: 'Lady Finger Chocolate Feuilletine' }, price: 25 },
  { name: { ar: 'تيراميسو', en: 'Tramisu' }, price: 24 },
  { name: { ar: 'بوكس ميني شو', en: 'Mini Choux Box' }, price: 25 },
  { name: { ar: 'شاي حبق مثلج', en: 'Iced Habagk Tea' }, price: 22 },
  { name: { ar: 'كركديه', en: 'Karkade (Hibiscus)' }, price: 16 },
  { name: { ar: 'أيس أمريكانو', en: 'Iced Americano' }, price: 13 },
  { name: { ar: 'أيس لاتيه', en: 'Iced Latte' }, price: 18 },
  { name: { ar: 'سبانش لاتيه', en: 'Spanish Latte' }, price: 26 },
  { name: { ar: 'فلات وايت', en: 'Flat White' }, price: 17 },
  { name: { ar: 'V60 / V60 بارد', en: 'V60 / Cold V60' }, price: 22 },
  { name: { ar: 'كورتادو', en: 'Cortado' }, price: 19 },
  { name: { ar: 'إسبريسو', en: 'Espresso' }, price: 14 },
  { name: { ar: 'كابتشينو', en: 'Cappuccino' }, price: 18 },
  { name: { ar: 'قهوة اليوم', en: 'Coffee of the Day' }, price: 11 },
];

export const UI_STRINGS = {
  ar: {
    currency: 'ريال',
    back: 'العودة للرئيسية',
    contact: 'تواصل معنا',
    deliveryPrice: 'السعر',
  },
  en: {
    currency: 'AED',
    back: 'Back to Home',
    contact: 'Contact Us',
    deliveryPrice: 'Price',
  }
};