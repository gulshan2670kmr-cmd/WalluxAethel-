/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ye colors luxury neon look ke liye zaroori hain
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        zinc: {
          900: '#18181b',
          950: '#09090b',
        }
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
