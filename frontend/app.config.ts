import config from './app.json';
export default { ...config.expo, name: 'One Latur', extra: { backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL } };