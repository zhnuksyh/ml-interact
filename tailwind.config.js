/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            colors: {
                // We can add custom colors here if needed to match the legacy theme perfectly
                // but Tailwind's slate/blue palette used in the legacy code aligns well already.
            }
        },
    },
    plugins: [],
}
