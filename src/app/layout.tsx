import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://srivtx.github.io"),
  title: "Aurelia — Style & Beauty Tips",
  description:
    "Your pocket beauty editor: color combinations, makeup basics, skincare know-how and hairstyle guides — all in one warm, clutter-free app.",
  applicationName: "Aurelia",
  manifest: "/manifest.json",
  keywords: [
    "fashion tips",
    "color combinations",
    "makeup for beginners",
    "skincare basics",
    "oily skin",
    "hairstyles",
    "beauty app",
    "style guide",
  ],
  openGraph: {
    type: "website",
    siteName: "Aurelia",
    title: "Aurelia — your pocket beauty editor",
    description:
      "Color combos that always work, makeup from zero, skincare that makes sense, hair that matches your outfit. One warm little app ✦",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Aurelia — style & beauty tips app" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurelia — your pocket beauty editor",
    description: "Colors, makeup, skincare & hair — one warm little app ✦",
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aurelia",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* zoom stays enabled — WCAG 1.4.4 (never disable user scaling) */
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F3" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1518" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aurelia-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){document.documentElement.classList.add('dark');document.documentElement.style.backgroundColor='#1C1518';document.documentElement.style.colorScheme='dark'}else{document.documentElement.style.backgroundColor='#FAF7F3';document.documentElement.style.colorScheme='light'}}catch(e){}})();`,
          }}
        />
        {/* iOS splash screens (generated with brand gradient + mark) */}
        <link rel="apple-touch-startup-image" href="/icons/splash-1290x2796.png" media="screen-width: 430px and screen-height: 932px and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-1290x2796-dark.png" media="(prefers-color-scheme: dark) and screen-width: 1290px and screen-height: 2796px and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-1179x2556.png" media="screen-width: 393px and screen-height: 852px and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-1179x2556-dark.png" media="(prefers-color-scheme: dark) and screen-width: 1179px and screen-height: 2556px and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-1284x2778.png" media="screen-width: 428px and screen-height: 926px and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-1284x2778-dark.png" media="(prefers-color-scheme: dark) and screen-width: 1284px and screen-height: 2778px and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-1170x2532.png" media="screen-width: 390px and screen-height: 844px and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-1170x2532-dark.png" media="(prefers-color-scheme: dark) and screen-width: 1170px and screen-height: 2532px and (-webkit-device-pixel-ratio: 3)" />
      </head>
      <body
        className={`${display.variable} ${body.variable} antialiased bg-background text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
