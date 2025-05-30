'use client';

import "./globals.css";
import i18n from '@/i18n';
import { I18nextProvider } from 'react-i18next';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get environment variables
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "";
  const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "";

  // Check if both values are non-empty
  const shouldLoadPlausible = plausibleDomain.trim() !== "" && plausibleSrc.trim() !== "";

  return (
    <html lang="en">
      <head>
        <title>Vinyl Library</title>
        <meta name="description" content="Vinyl Library" />
        {/* Plausible Analytics - Only loads if both variables have values */}
        {shouldLoadPlausible && (
          <Script
            defer
            data-domain={plausibleDomain}
            src={plausibleSrc}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </body>
    </html>
  );
}