import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar/Sidebar";
import RightSidebar from "@/components/RightSidebar/RightSidebar";
import Header from "@/components/Header/Header";
import PageTransition from "@/components/PageTransition";
import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper";
import { Providers } from "./providers";
import DeepWorkOverlay from "@/components/DeepWorkOverlay/DeepWorkOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Brainexe | Command Center",
  description: "An AI-powered productivity dashboard to manage tasks, track progress, and boost efficiency.",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b1326" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries" async></script>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
              background-color: #0b1326;
              color: #dae2fd;
              overflow-x: hidden;
          }

          .zen-panel {
              position: relative;
              overflow: hidden;
          }

          .neon-glow-violet {
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
          }

          .aura-sphere {
              position: fixed;
              width: 800px;
              height: 800px;
              border-radius: 50%;
              filter: blur(150px);
              z-index: -1;
              opacity: 0.15;
              pointer-events: none;
          }

          .aura-sphere-violet {
              animation: float-violet 25s ease-in-out infinite alternate;
          }

          .aura-sphere-blue {
              animation: float-blue 30s ease-in-out infinite alternate;
          }

          @keyframes float-violet {
              0% { transform: translate(0px, 0px) scale(1); opacity: 0.12; }
              50% { transform: translate(60px, -40px) scale(1.1); opacity: 0.18; }
              100% { transform: translate(-30px, 20px) scale(0.9); opacity: 0.12; }
          }

          @keyframes float-blue {
              0% { transform: translate(0px, 0px) scale(1); opacity: 0.08; }
              50% { transform: translate(-50px, 60px) scale(0.95); opacity: 0.13; }
              100% { transform: translate(40px, -20px) scale(1.05); opacity: 0.08; }
          }

          .date-wheel-container {
              mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }

          @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
          }

          .shimmer-bar::after {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
              animation: shimmer 2s infinite;
          }

          .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
          }
          
          /* Custom scrollbar for sleeker look */
          ::-webkit-scrollbar {
              width: 4px;
              height: 4px;
          }
          ::-webkit-scrollbar-track {
              background: transparent;
          }
          ::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.1);
              border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.3);
          }
        `}} />
        <script
          id="tailwind-config"
          dangerouslySetInnerHTML={{
            __html: `
              window.tailwind = window.tailwind || {};
              tailwind.config = {
                  darkMode: "class",
                  theme: {
                      extend: {
                          "colors": {
                              "primary-fixed": "#e9ddff",
                              "primary": "#8b5cf6",
                              "surface-container-low": "#131b2e",
                              "outline-variant": "#494454",
                              "secondary-fixed-dim": "#89ceff",
                              "tertiary-fixed": "#ffd8e7",
                              "surface-variant": "#1e2638",
                              "on-primary-fixed-variant": "#5516be",
                              "outline": "#958ea0",
                              "secondary-fixed": "#c9e6ff",
                              "on-secondary-container": "#00344e",
                              "tertiary": "#ffafd3",
                              "error-container": "#93000a",
                              "on-primary": "#ffffff",
                              "surface-container": "#171f33",
                              "on-error": "#690005",
                              "background": "#0b1326",
                              "surface-bright": "#31394d",
                              "surface-container-high": "#222a3d",
                              "surface": "#0b1326",
                              "on-primary-container": "#340080",
                              "on-secondary": "#00344d",
                              "surface-dim": "#0b1326",
                              "on-error-container": "#ffdad6",
                              "inverse-primary": "#6d3bd7",
                              "tertiary-fixed-dim": "#ffafd3",
                              "surface-tint": "#8b5cf6",
                              "surface-container-lowest": "#060e20",
                              "on-tertiary-container": "#560038",
                              "on-primary-fixed": "#23005c",
                              "inverse-on-surface": "#283044",
                              "secondary-container": "#00a2e6",
                              "on-surface": "#dae2fd",
                              "tertiary-container": "#e364a7",
                              "on-tertiary-fixed": "#3d0026",
                              "on-tertiary-fixed-variant": "#85145a",
                              "on-background": "#dae2fd",
                              "primary-fixed-dim": "#8b5cf6",
                              "surface-container-highest": "#2d3449",
                              "on-tertiary": "#620040",
                              "secondary": "#a78bfa",
                              "on-surface-variant": "#94a3b8",
                              "inverse-surface": "#dae2fd",
                              "error": "#ffb4ab",
                              "on-secondary-fixed-variant": "#004c6e",
                              "on-secondary-fixed": "#001e2f",
                              "primary-container": "#7c3aed"
                          },
                          "borderRadius": {
                              "DEFAULT": "0.5rem",
                              "lg": "0.75rem",
                              "xl": "1rem",
                              "2xl": "1.5rem",
                              "full": "9999px"
                          },
                          "spacing": {
                              "bento-gap": "24px",
                              "unit": "8px",
                              "container-max": "1440px",
                              "margin": "40px",
                              "gutter": "32px"
                          },
                          "fontFamily": {
                              "body-md": ["Geist", "sans-serif"],
                              "body-lg": ["Geist", "sans-serif"],
                              "headline-lg": ["Sora", "sans-serif"],
                              "display-lg": ["Sora", "sans-serif"],
                              "label-caps": ["JetBrains Mono", "monospace"],
                              "headline-md": ["Sora", "sans-serif"],
                              "stat-value": ["JetBrains Mono", "monospace"]
                          },
                          "fontSize": {
                              "body-md": ["14px", {"lineHeight": "22px", "fontWeight": "400"}],
                              "body-lg": ["16px", {"lineHeight": "26px", "fontWeight": "400"}],
                              "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                              "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                              "label-caps": ["11px", {"lineHeight": "1", "letterSpacing": "0.15em", "fontWeight": "600"}],
                              "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                              "stat-value": ["24px", {"lineHeight": "1", "fontWeight": "600"}]
                          }
                      }
                  }
              }
            `
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-body-md overflow-hidden flex h-screen bg-background text-on-surface`}>
        {/* Ambient aura lights */}
        <div className="aura-sphere aura-sphere-violet bg-primary top-[-20%] left-[-10%] select-none pointer-events-none"></div>
        <div className="aura-sphere aura-sphere-blue bg-secondary bottom-[-20%] right-[-10%] select-none pointer-events-none"></div>

        <Providers>
          <AuthWrapper>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main scrollable content zone */}
            <main className="lg:ml-56 flex-1 overflow-y-auto p-4 sm:p-8 relative bg-transparent xl:pr-64 h-full scroll-smooth">
              
              {/* Responsive Header */}
              <Header />

              {/* Dynamic Page content */}
              <PageTransition>
                {children}
              </PageTransition>
            </main>

            {/* Right Sidebar widgets */}
            <RightSidebar />
            <DeepWorkOverlay />
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
