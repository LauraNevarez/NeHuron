import {Platform} from 'react-native';

// URLs base según entorno:
// - 10.0.2.2 es el host para el Emulador de Android
// - 192.168.1.69 es la IP local de tu PC para teléfono físico vía WiFi
// - localhost para iOS o adb reverse
const DEV_HOSTS = [
  'http://192.168.1.69:3000',
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000',
  'http://localhost:3000',
];

let activeBaseUrl = DEV_HOSTS[0];

/**
 * Realiza una petición con timeout rápido
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Intenta conectar enviando la petición a los hosts disponibles
 */
async function requestWithFallback(endpoint, options = {}) {
  let lastError = null;

  // 1. Probar primero el activeBaseUrl
  const hostsToTry = [activeBaseUrl, ...DEV_HOSTS.filter(h => h !== activeBaseUrl)];

  for (const host of hostsToTry) {
    try {
      const fullUrl = `${host}${endpoint}`;
      const response = await fetchWithTimeout(
        fullUrl,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...options.headers,
          },
          ...options,
        },
        5000
      );

      const data = await response.json();
      activeBaseUrl = host; // Recordar host funcional
      return {ok: response.ok, status: response.status, data};
    } catch (err) {
      lastError = err;
      // Probar siguiente host
    }
  }

  return {
    ok: false,
    status: 0,
    data: {
      message:
        'No se pudo conectar con el servidor de base de datos. Verifica que el backend esté corriendo (npm start en la carpeta backend).',
      error: lastError?.message,
    },
  };
}

/**
 * Valida credenciales de login contra MongoDB
 */
export async function apiLogin(email, password) {
  return await requestWithFallback('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });
}

/**
 * Registra un nuevo usuario en MongoDB
 */
export async function apiRegister(email, password, userName) {
  return await requestWithFallback('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({email, password, userName}),
  });
}

/**
 * Sincroniza datos de progreso a MongoDB
 */
export async function apiSyncProgress(payload) {
  return await requestWithFallback('/api/auth/sync', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export default {
  apiLogin,
  apiRegister,
  apiSyncProgress,
};
