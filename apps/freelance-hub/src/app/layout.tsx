import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";

const departureFont = localFont({
  src: "./DepartureMono-Regular.woff2",
  variable: "--font-departure",
});

export const metadata: Metadata = {
  title: "Freelance Hub – Web Dev Control Room",
  description:
    "Coordinate freelance web developers, monitor delivery health, and trigger payouts from a single AI workspace.",
  icons: {
    icon: [
      { url: "/heart-favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.className} ${departureFont.variable} antialiased min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
