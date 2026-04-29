import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: '#1A5FA8',
            50:  '#EBF3FB',
            100: '#C3DAF3',
            200: '#9BC1EB',
            300: '#5E9BD9',
            400: '#2E78C0',
            500: '#1A5FA8',
            600: '#164E8C',
            700: '#113D6F',
            800: '#0C2C52',
            900: '#071B35',
          },
          green: {
            DEFAULT: '#7DC242',
            50:  '#F0F9E8',
            100: '#D4EDB8',
            200: '#B8E088',
            300: '#9CD458',
            400: '#8ACB4D',
            500: '#7DC242',
            600: '#65A034',
            700: '#4D7D27',
            800: '#365A1A',
            900: '#1E360D',
          },
          light: '#4BA3D8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-lg': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}

export default config
