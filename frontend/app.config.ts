import config from './app.json';
export default { ...config.expo, name: 'OneCity', extra: { backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL } };