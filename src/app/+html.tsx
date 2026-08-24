import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RepLog" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#07080B" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #07080B !important;
            overflow: hidden !important;
          }
        `}} />
      </head>
      <body style={{ backgroundColor: '#07080B' }}>{children}</body>
    </html>
  );
}
