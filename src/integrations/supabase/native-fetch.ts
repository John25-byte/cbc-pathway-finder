// Returns a fetch implementation that bypasses any monkey-patched window.fetch
// Works in both localhost and preview environments

let cachedFetch: typeof fetch | null = null;
let initPromise: Promise<typeof fetch> | null = null;

export function getNativeFetch(): typeof fetch {
  if (cachedFetch) {
    return cachedFetch;
  }

  // Immediately try to return a working fetch
  if (typeof window === "undefined") {
    return fetch;
  }

  // Try to use window.fetch directly first - it often works fine
  cachedFetch = createWrappedFetch();
  return cachedFetch;
}

function createWrappedFetch(): typeof fetch {
  // Direct fetch wrapper that handles both localhost and preview
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      // For auth requests, ensure proper headers and handling
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      // Log auth requests for debugging
      if (url && url.includes('/auth')) {
        console.debug('[Supabase Auth Request]', {
          url,
          method: init?.method || 'GET',
          timestamp: new Date().toISOString()
        });
      }

      // Try the request
      const response = await window.fetch(input, init);

      if (!response.ok && url && url.includes('/auth')) {
        console.warn('[Supabase Auth Response]', {
          url,
          status: response.status,
          statusText: response.statusText
        });
      }

      return response;
    } catch (error) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as any).url;
      console.error('[Supabase Fetch Error]', {
        url,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });

      // If window.fetch fails, try iframe approach as fallback
      if (!initPromise) {
        initPromise = getIframeFetch();
      }

      const iframeFetch = await initPromise;
      return iframeFetch(input, init);
    }
  };
}

async function getIframeFetch(): Promise<typeof fetch> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(window.fetch.bind(window));
      return;
    }

    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "display:none;";
      iframe.setAttribute("sandbox", "allow-same-origin");
      iframe.src = "about:blank";

      let resolved = false;

      const complete = () => {
        if (resolved) return;
        resolved = true;

        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow?.fetch) {
            const nativeFetch = iframeWindow.fetch.bind(iframeWindow);
            if (iframe.parentElement) {
              iframe.parentElement.removeChild(iframe);
            }
            resolve(nativeFetch);
            return;
          }
        } catch (e) {
          console.warn("[iframe Fetch] Failed to access iframe fetch", e);
        }

        // Fallback to window.fetch
        if (iframe.parentElement) {
          try {
            iframe.parentElement.removeChild(iframe);
          } catch (e) {
            // ignore
          }
        }
        resolve(window.fetch.bind(window));
      };

      iframe.addEventListener("load", complete, { once: true });
      document.body.appendChild(iframe);

      // Timeout in case load doesn't fire
      setTimeout(complete, 1000);
    } catch (error) {
      console.error("[Native Fetch Init] Failed:", error);
      resolve(window.fetch.bind(window));
    }
  });
}
