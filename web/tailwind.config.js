/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#D4AF37',        // Gold
                'primary-light': '#E8C966',
                'primary-dark': '#C9A955',
                background: '#000000',
                'card-bg': '#1A1A1A',
                surface: '#1A1A1A',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
