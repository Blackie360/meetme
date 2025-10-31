import type { Metadata } from "next";
import { ABeeZee, Merriweather, Source_Code_Pro } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const abeeZee = ABeeZee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meetme.blackie.tech"),
  title: {
    default: "MeetMe – Scheduling without the friction",
    template: "%s | MeetMe",
  },
  description:
    "MeetMe is your AI scheduling copilot that syncs every calendar, honors buffers, and automates the follow-up so teams can focus on the conversations that move revenue.",
  keywords: [
    "AI scheduling",
    "meeting automation",
    "calendar routing",
    "revenue operations",
    "MeetMe",
  ],
  openGraph: {
    type: "website",
    url: "https://meetme.blackie.tech/",
    siteName: "MeetMe",
    title: "MeetMe – Scheduling without the friction",
    description:
      "Share one adaptive link that routes guests to the right host, syncs calendars in real time, and keeps every meeting on track with intelligent follow-ups.",
    images: [
      {
        url: "/og-meetme.svg",
        width: 1200,
        height: 630,
        alt: "MeetMe scheduling dashboard with highlighted availability slots",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetMe – Scheduling without the friction",
    description:
      "MeetMe is the fastest way to turn interest into confirmed meetings with AI-powered routing, follow-ups, and analytics.",
    images: [
      {
        url: "/og-meetme.svg",
        alt: "MeetMe scheduling dashboard with highlighted availability slots",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${abeeZee.variable} ${merriweather.variable} ${sourceCodePro.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
