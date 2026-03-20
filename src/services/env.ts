export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api'),
  appName: import.meta.env.VITE_APP_NAME ?? 'AdFido',
  enableDemoAuth: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true',
  googleMapsApiKey:
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? import.meta.env.GOOGLE_MAPS_API_KEY ?? '',
};
