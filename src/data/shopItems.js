import {ACCESSORY_SVGS} from '../assets/mascota/accessories';

/**
 * Catálogo Oficial de Accesorios NehurOn (SVG nativos de 1024x1024)
 * Categorías:
 *  - 'hat': Sombreros, gorras, audífonos, accesorios de cabeza
 *  - 'glasses': Lentes, antifaces, mostacho, accesorios de rostro
 */
export const SHOP_ITEMS = [
  // --- Categoría: Sombreros y Accesorios de Cabeza ('hat') ---
  {
    id: 'hat_gorra',
    category: 'hat',
    name: 'Gorra NehurOn',
    price: 200,
    svgXml: ACCESSORY_SVGS.hat_gorra,
  },
  {
    id: 'hat_sombrero',
    category: 'hat',
    name: 'Sombrero Clásico',
    price: 300,
    svgXml: ACCESSORY_SVGS.hat_sombrero,
  },
  {
    id: 'hat_birrete',
    category: 'hat',
    name: 'Birrete de Graduado',
    price: 400,
    svgXml: ACCESSORY_SVGS.hat_birrete,
  },
  {
    id: 'hat_audifonos',
    category: 'hat',
    name: 'Audífonos Gamer',
    price: 350,
    svgXml: ACCESSORY_SVGS.hat_audifonos,
  },
  {
    id: 'hat_airpods',
    category: 'hat',
    name: 'AirPods Pro',
    price: 250,
    svgXml: ACCESSORY_SVGS.hat_airpods,
  },

  // --- Categoría: Lentes y Rostro ('glasses') ---
  {
    id: 'gl_clasicos',
    category: 'glasses',
    name: 'Lentes Intelectual',
    price: 150,
    svgXml: ACCESSORY_SVGS.gl_clasicos,
  },
  {
    id: 'gl_sol',
    category: 'glasses',
    name: 'Lentes de Sol',
    price: 300,
    svgXml: ACCESSORY_SVGS.gl_sol,
  },
  {
    id: 'gl_pixel',
    category: 'glasses',
    name: 'Lentes Pixel Thug',
    price: 500,
    svgXml: ACCESSORY_SVGS.gl_pixel,
  },
  {
    id: 'gl_mostacho',
    category: 'glasses',
    name: 'Mostacho Distinguido',
    price: 200,
    svgXml: ACCESSORY_SVGS.gl_mostacho,
  },
];

export const getItem = id => SHOP_ITEMS.find(i => i.id === id) || null;

export const DEFAULT_BLOCKED_APPS = [
  {pkg: 'com.instagram.android', name: 'Instagram'},
  {pkg: 'com.zhiliaoapp.musically', name: 'TikTok'},
  {pkg: 'com.facebook.katana', name: 'Facebook'},
  {pkg: 'com.twitter.android', name: 'X / Twitter'},
  {pkg: 'com.google.android.youtube', name: 'YouTube'},
  {pkg: 'com.snapchat.android', name: 'Snapchat'},
  {pkg: 'com.reddit.frontpage', name: 'Reddit'},
];
