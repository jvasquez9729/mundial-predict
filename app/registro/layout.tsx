"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function NgrokSkipper() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Función para saltarse la advertencia de ngrok de forma agresiva
    const skipNgrokWarning = () => {
      // Verificar si estamos en la página de advertencia de ngrok
      const pageText = document.body?.textContent || "";
      const isNgrokWarning = 
        pageText.includes("You are about to visit") ||
        pageText.includes("ngrok.com") ||
        pageText.includes("This website is served for free through ngrok") ||
        pageText.includes("Are you the developer?") ||
        pageText.includes("To remove this page");

      if (isNgrokWarning) {
        console.log("Ngrok warning page detected, attempting to skip...");

        // Intentar múltiples métodos para hacer clic en el botón
        const methods = [
          // Método 1: Buscar botón "Visit Site"
          () => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const visitButton = buttons.find(
              (btn) =>
                btn.textContent?.includes("Visit Site") ||
                btn.textContent?.includes("Visit") ||
                btn.textContent?.trim() === "Visit Site"
            );
            if (visitButton) {
              console.log("Found Visit Site button, clicking...");
              visitButton.click();
              return true;
            }
            return false;
          },

          // Método 2: Buscar cualquier botón azul o con clase específica
          () => {
            const button = document.querySelector(
              'button[class*="blue"], button[style*="blue"], a[href]'
            ) as HTMLButtonElement | HTMLAnchorElement;
            if (button) {
              console.log("Found button/link, clicking...");
              button.click();
              return true;
            }
            return false;
          },

          // Método 3: Buscar por texto del botón
          () => {
            const xpath = "//button[contains(text(), 'Visit') or contains(text(), 'Site')]";
            const result = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            );
            const button = result.singleNodeValue as HTMLButtonElement;
            if (button) {
              console.log("Found button via XPath, clicking...");
              button.click();
              return true;
            }
            return false;
          },

          // Método 4: Usar el primer botón disponible
          () => {
            const button = document.querySelector("button") as HTMLButtonElement;
            if (button && button.offsetParent !== null) {
              console.log("Found first visible button, clicking...");
              button.click();
              return true;
            }
            return false;
          },

          // Método 5: Intentar recargar con el header necesario (como último recurso)
          () => {
            const currentUrl = window.location.href;
            if (currentUrl.includes("/registro")) {
              console.log("Already on registration page, reloading...");
              // No hacer nada, ya estamos en la página correcta
              return true;
            }
            return false;
          },
        ];

        // Intentar cada método
        for (const method of methods) {
          try {
            if (method()) {
              return true;
            }
          } catch (error) {
            console.error("Error in skip method:", error);
          }
        }

        // Si nada funcionó, intentar navegar directamente
        const url = new URL(window.location.href);
        if (url.pathname !== "/registro" && searchParams.get("t")) {
          const token = searchParams.get("t");
          console.log("Redirecting directly to registration...");
          window.location.href = `/registro?t=${encodeURIComponent(token || "")}`;
          return true;
        }
      }
      return false;
    };

    // Ejecutar inmediatamente
    if (!skipNgrokWarning()) {
      // Si no funcionó inmediatamente, intentar varias veces
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(() => {
        attempts++;
        if (skipNgrokWarning() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 100);

      // Observar cambios en el DOM
      const observer = new MutationObserver(() => {
        if (skipNgrokWarning()) {
          observer.disconnect();
          clearInterval(interval);
        }
      });

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      }

      // Limpiar después de 5 segundos
      setTimeout(() => {
        clearInterval(interval);
        observer.disconnect();
      }, 5000);
    }
  }, [searchParams]);

  return null;
}

/**
 * Layout especial para la página de registro que detecta y salta la advertencia de ngrok
 */
export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <NgrokSkipper />
      </Suspense>
      {children}
    </>
  );
}
