// Todas las imágenes son PNG transparentes de 512x512 alineadas con el cuerpo de Avy,
// así que se apilan sin offsets.
export const AVATAR_BODY = require('../assets/avy_body.png');

export const SHOP_ITEMS = [
  {id: 'hat_cap', category: 'hat', name: 'Gorra', price: 200, image: require('../assets/accessories/hat_cap.png')},
  {id: 'hat_wizard', category: 'hat', name: 'Mago', price: 400, image: require('../assets/accessories/hat_wizard.png')},
  {id: 'hat_crown', category: 'hat', name: 'Corona', price: 600, image: require('../assets/accessories/hat_crown.png')},
  {id: 'gl_round', category: 'glasses', name: 'Redondos', price: 150, image: require('../assets/accessories/glasses_round.png')},
  {id: 'gl_sun', category: 'glasses', name: 'Sol', price: 300, image: require('../assets/accessories/glasses_sun.png')},
  {id: 'gl_pixel', category: 'glasses', name: 'Pixel', price: 500, image: require('../assets/accessories/glasses_pixel.png')},
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
