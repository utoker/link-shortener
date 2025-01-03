/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff', // Light background color
        foreground: '#2d3748', // Text color
        primary: '#319795', // Main brand color
        secondary: '#81e6d9', // Secondary color
        border: '#e2e8f0', // Border color
        input: '#edf2f7', // Input background color
        error: '#e53e3e', // Error message color
        muted: '#f7fafc', // Muted background or text
        accent: '#3182ce', // Accent color for links
        card: '#ffffff', // Card background
        button: {
          primary: '#4caf50',
          secondary: '#03a9f4',
        },
        popover: '#ffffff',
        destructive: '#e53e3e',
        ring: '#3182ce',
        chart: {
          1: '#1a365d',
          2: '#2a4365',
          3: '#2c5282',
          4: '#2b6cb0',
          5: '#3182ce',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-animate')],
};
