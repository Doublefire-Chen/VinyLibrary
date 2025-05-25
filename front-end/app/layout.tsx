'use client';

import "./globals.css";
import i18n from '@/i18n';
import { I18nextProvider } from 'react-i18next';

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
      </head>
      <body>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </body>
    </html>
  );
}
