/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./components/**/*.{ts,tsx}",
        "./constants.tsx",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Outfit"', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f3ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    950: '#0a0a1f',
                },
                accent: {
                    emerald: '#10b981',
                    amber: '#f59e0b',
                    rose: '#f43f5e',
                    violet: '#8b5cf6',
                    cyan: '#06b6d4'
                }
            },
            boxShadow: {
                'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.08)',
                'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
            }
        }
    },
    plugins: [],
}
