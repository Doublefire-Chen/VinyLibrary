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
  return (
    <html lang="en">
      <head>
        <title>Vinyl Library</title>
        <meta name="description" content="Vinyl Library" />
        {/* Plausible Analytics - Only loads if both variables have values */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN &&
          process.env.NEXT_PUBLIC_PLAUSIBLE_SRC &&
          process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN.trim() !== "" &&
          process.env.NEXT_PUBLIC_PLAUSIBLE_SRC.trim() !== "" && (
            <Script
              defer
              data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
              src={process.env.NEXT_PUBLIC_PLAUSIBLE_SRC}
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
