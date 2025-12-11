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
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "zoom-in": {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "pop-in": {
                    "0%": { opacity: "0", transform: "scale(0.8)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                "typewriter": {
                    "from": { width: "0" },
                    "to": { width: "100%" },
                },
                "shimmer": {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.3s ease-out",
                "zoom-in": "zoom-in 0.3s ease-out",
                "slide-up": "slide-up 0.4s ease-out",
                "float": "float 4s ease-in-out infinite",
                "pop-in": "pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                "typewriter": "typewriter 2s steps(40) forwards",
                "shimmer": "shimmer 3s linear infinite",
                "spin-slow": "spin 8s linear infinite",
            },
        },
    },
    plugins: [],
}
