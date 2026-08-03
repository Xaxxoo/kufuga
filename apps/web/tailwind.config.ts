import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#173b2d', moss: '#176b4d', mint: '#e5f3eb', line: '#dce9e2' } } }, plugins: [] };
export default config;
