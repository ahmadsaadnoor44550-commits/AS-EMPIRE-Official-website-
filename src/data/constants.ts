import { StoreSettings } from '../types';

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Gujranwala',
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhang',
  'Rahim Yar Khan',
  'Gujrat',
  'Mardan',
  'Kasur',
  'Sahiwal',
  'Okara',
  'Wah Cantonment',
  'Dera Ghazi Khan',
  'Mirpur (AJK)',
  'Muzaffarabad (AJK)',
  'Jhelum',
  'Other City in Pakistan'
];

export const INITIAL_BUSINESS_CATEGORIES = [
  'Mobile LCDs',
  'Mobile LEDs',
  'OLED Screens',
  'Mobile Accessories'
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'SAAD TRADING COMPANY',
  ownerName: 'Ahmad Saad',
  tagline: 'Premium Mobile LCDs, LEDs, OLED Screens & Accessories',
  whatsappNumber: '03330916398', // Owner real WhatsApp number
  contactEmail: 'ahmadsaadnoor44550@gmail.com',
  contactPhone: '03330916398',
  businessAddress: '',
  logoUrl: '',
  bannerUrl: '',
  announcement: 'Welcome to SAAD TRADING COMPANY – Premium Mobile Displays & Phone Accessories. Contact us on WhatsApp for verified orders.',
  aboutText: 'SAAD TRADING COMPANY is your trusted source for premium Mobile LCDs, Mobile LEDs, OLED Screens, and mobile accessories in Pakistan. Every product is individually inspected for guaranteed display quality.',
  ownerIntro: '',
  deliveryFee: 250,
  freeDeliveryThreshold: 5000,
  paymentInstructions: 'Payment is arranged directly with the seller on WhatsApp. We support EasyPaisa, JazzCash, and direct Bank Transfer.',
  easyPaisaAccount: '',
  jazzCashAccount: '',
  bankAccountDetails: '',
  categories: INITIAL_BUSINESS_CATEGORIES
};

// Pakistani Rupee Formatter
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs. 0';
  }
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}
