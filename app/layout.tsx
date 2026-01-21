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
                
                // Agregar header ngrok-skip-browser-warning para saltarse la advertencia de ngrok
                const isNgrok = window.location.hostname.includes('.ngrok') || 
                               window.location.hostname.includes('ngrok-free') || 
                               window.location.hostname.includes('ngrok.io');
                
                if (isNgrok) {
                  // Interceptar fetch para agregar el header
                  const originalFetch = window.fetch;
                  window.fetch = function(...args) {
                    const [url, options = {}] = args;
                    const newOptions = {
                      ...options,
                      headers: {
                        ...options.headers,
                        'ngrok-skip-browser-warning': 'true'
                      }
                    };
                    return originalFetch.apply(this, [url, newOptions]);
                  };
                  
                  // Interceptar XMLHttpRequest para agregar el header
                  const originalOpen = XMLHttpRequest.prototype.open;
                  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
                  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                    this._url = url;
                    return originalOpen.apply(this, [method, url, ...rest]);
                  };
                  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
                    if (name.toLowerCase() !== 'ngrok-skip-browser-warning') {
                      return originalSetRequestHeader.apply(this, [name, value]);
                    }
                  };
                  
                  const originalSend = XMLHttpRequest.prototype.send;
                  XMLHttpRequest.prototype.send = function(...args) {
                    if (!this._headers) {
                      this._headers = {};
                    }
                    this._headers['ngrok-skip-browser-warning'] = 'true';
                    const headers = this._headers;
                    Object.keys(headers).forEach(key => {
                      originalSetRequestHeader.call(this, key, headers[key]);
                    });
                    return originalSend.apply(this, args);
                  };
                  
                  // Si estamos en la página de advertencia de ngrok, redirigir automáticamente
                  if (document.body && document.body.textContent && 
                      document.body.textContent.includes('You are about to visit')) {
                    const visitButton = document.querySelector('button, a[href]');
                    if (visitButton) {
                      visitButton.click();
                    }
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
