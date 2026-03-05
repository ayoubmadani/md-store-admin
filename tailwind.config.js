/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4f46e5', // Indigo-600
          dark: '#18181b',    // Zinc-900
          success: '#10b981', // Emerald-500
          danger: '#e11d48',  // Rose-600
          warning: '#f59e0b', // Amber-500
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
}