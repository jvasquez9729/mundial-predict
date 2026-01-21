import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LocaleProvider } from '@/contexts/locale-context'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mundial Predict - Copa del Mundo 2026',
  description: 'Predice los resultados del Mundial 2026 y compite por increíbles premios',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
      <head>
        {/* Script para saltarse la advertencia de ngrok - debe ejecutarse ANTES que todo */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Detectar y saltarse automáticamente la página de advertencia de ngrok
              // Este script se ejecuta ANTES de que la página cargue completamente
              (function() {
                function skipNgrokWarning() {
                  // Verificar si estamos en la página de advertencia de ngrok
                  const bodyText = (document.body && document.body.textContent) || '';
                  const isNgrokWarning = 
                    bodyText.includes('You are about to visit') ||
                    bodyText.includes('ngrok.com') ||
                    bodyText.includes('This website is served for free through ngrok') ||
                    bodyText.includes('Are you the developer?') ||
                    bodyText.includes('Website IP:') ||
                    (window.location.hostname.includes('ngrok') && bodyText.includes('Visit Site'));
                  
                  if (isNgrokWarning) {
                    console.log('[Ngrok Skip] Warning page detected');
                    
                    // Buscar el botón "Visit Site" de múltiples formas
                    const selectors = [
                      'button',
                      'button[type="button"]',
                      'a[href]',
                      '[class*="button"]',
                      '[class*="btn"]'
                    ];
                    
                    for (const selector of selectors) {
                      const elements = document.querySelectorAll(selector);
                      for (const el of Array.from(elements)) {
                        const text = el.textContent || '';
                        if (text.includes('Visit Site') || 
                            text.includes('Visit') || 
                            text.includes('Continuar') ||
                            (el.tagName === 'BUTTON' && el.offsetParent !== null)) {
                          console.log('[Ngrok Skip] Clicking button:', el);
                          (el as HTMLElement).click();
                          return true;
                        }
                      }
                    }
                    
                    // Si no hay botón, intentar navegar directamente
                    const currentUrl = window.location.href;
                    const tokenMatch = currentUrl.match(/[?&]t=([^&]+)/);
                    if (tokenMatch) {
                      const token = tokenMatch[1];
                      const targetUrl = window.location.origin + '/registro?t=' + encodeURIComponent(token);
                      console.log('[Ngrok Skip] Redirecting to:', targetUrl);
                      window.location.href = targetUrl;
                      return true;
                    }
                  }
                  return false;
                }
                
                // Ejecutar inmediatamente si el DOM está listo
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', skipNgrokWarning);
                } else {
                  skipNgrokWarning();
                }
                
                // Intentar varias veces con intervalos cortos
                let attempts = 0;
                const maxAttempts = 30;
                const interval = setInterval(function() {
                  attempts++;
                  if (skipNgrokWarning() || attempts >= maxAttempts) {
                    clearInterval(interval);
                  }
                }, 50); // Verificar cada 50ms
                
                // Observar cambios en el DOM
                if (document.body) {
                  const observer = new MutationObserver(function() {
                    if (skipNgrokWarning()) {
                      observer.disconnect();
                      clearInterval(interval);
                    }
                  });
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true
                  });
                }
                
                // Limpiar después de 3 segundos
                setTimeout(function() {
                  clearInterval(interval);
                }, 3000);
              })();
            `,
          }}
        />
      </head>
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
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
