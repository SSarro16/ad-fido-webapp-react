export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api'),
  appName: import.meta.env.VITE_APP_NAME ?? 'AdFido',
  enableDemoAuth: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  },
  googleMapsApiKey:
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? import.meta.env.GOOGLE_MAPS_API_KEY ?? '',
};
