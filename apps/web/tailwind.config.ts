import type { Config } from 'tailwindcss';
import preset from '@kufuga/ui/tailwind-preset';

const config: Config = {
  presets: [preset as any],
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
export default config;
