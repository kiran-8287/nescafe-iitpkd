/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brown: {
                    900: '#3E2723',
                    800: '#5D4037',
                    700: '#8D6E63',
                },
                gold: {
                    500: '#D4AF37',
                }
            }
        },
    },
    plugins: [],
}
