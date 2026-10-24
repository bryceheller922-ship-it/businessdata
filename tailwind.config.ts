import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink: '#141923', muted: '#667085', canvas: '#f5f7fa', violet: '#6549e8' }, boxShadow: { soft: '0 8px 30px rgba(28,37,54,.07)' } } }, plugins: [] };
export default config;
