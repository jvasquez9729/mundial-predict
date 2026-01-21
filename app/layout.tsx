import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LocaleProvider } from '@/contexts/locale-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Mundial Predict - Copa del Mundo 2026',
  description: 'Predice los resultados de la Copa del Mundo 2026. Compite con amigos y sube en la clasificación.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <LocaleProvider>
          {children}
        </LocaleProvider>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Ocultar Next.js Dev Tools overlay
              if (typeof window !== 'undefined') {
                const hideDevTools = () => {
                  const overlays = document.querySelectorAll('[data-nextjs-dialog-overlay], [data-nextjs-toast], nextjs-portal');
                  overlays.forEach(el => {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                  });
                  
                  const buttons = document.querySelectorAll('button[aria-label*="Dev Tools"], button[aria-label*="Next.js"]');
                  buttons.forEach(btn => {
                    const parent = btn.closest('div');
                    if (parent) {
                      parent.style.display = 'none';
                      parent.style.visibility = 'hidden';
                      parent.style.opacity = '0';
                      parent.style.pointerEvents = 'none';
                    }
                  });
                };
                
                // Ejecutar inmediatamente
                hideDevTools();
                
                // Observar cambios en el DOM
                const observer = new MutationObserver(hideDevTools);
                observer.observe(document.body, { childList: true, subtree: true });
                
                // También ocultar después de que la página cargue
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', hideDevTools);
                }
                
                window.addEventListener('load', hideDevTools);
                
                // Detectar y saltarse automáticamente la página de advertencia de ngrok
                const skipNgrokWarning = () => {
                  const isNgrokWarning = document.body && (
                    document.body.textContent.includes('You are about to visit') ||
                    document.body.textContent.includes('You should only visit this website') ||
                    document.body.textContent.includes('Are you the developer?') ||
                    document.querySelector('button[type="button"]')?.textContent?.includes('Visit Site') ||
                    window.location.href.includes('ngrok') && document.querySelector('button')
                  );
                  
                  if (isNgrokWarning) {
                    // Buscar el botón "Visit Site" de diferentes formas
                    const visitButton = document.querySelector('button[type="button"]') ||
                                       document.querySelector('button') ||
                                       document.querySelector('a[href]') ||
                                       Array.from(document.querySelectorAll('button')).find(btn => 
                                         btn.textContent.includes('Visit') || 
                                         btn.textContent.includes('Site') ||
                                         btn.textContent.includes('Continuar')
                                       );
                    
                    if (visitButton) {
                      console.log('Ngrok warning detected, clicking Visit Site button...');
                      visitButton.click();
                      return true;
                    }
                    
                    // Si no hay botón, intentar navegar directamente a la URL sin el warning
                    const currentUrl = window.location.href;
                    if (currentUrl.includes('/registro')) {
                      // Ya estamos en /registro, solo necesitamos esperar
                      return false;
                    }
                    
                    // Intentar encontrar la URL destino en la página
                    const urlMatch = document.body.textContent.match(/https?:\/\/[^\s]+\.ngrok[^\s]+/);
                    if (urlMatch) {
                      window.location.href = urlMatch[0] + window.location.search;
                      return true;
                    }
                  }
                  return false;
                };
                
                // Ejecutar inmediatamente
                if (!skipNgrokWarning()) {
                  // Intentar varias veces porque ngrok puede cargar la página lentamente
                  let attempts = 0;
                  const maxAttempts = 10;
                  const checkInterval = setInterval(() => {
                    attempts++;
                    if (skipNgrokWarning() || attempts >= maxAttempts) {
                      clearInterval(checkInterval);
                    }
                  }, 100);
                  
                  // También escuchar cambios en el DOM
                  const ngrokObserver = new MutationObserver(() => {
                    if (skipNgrokWarning()) {
                      ngrokObserver.disconnect();
                    }
                  });
                  
                  if (document.body) {
                    ngrokObserver.observe(document.body, { childList: true, subtree: true });
                  }
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
