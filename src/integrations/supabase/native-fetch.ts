// Returns a fetch implementation that bypasses any monkey-patched window.fetch
// (e.g. the Lovable preview iframe injects a proxy that breaks Supabase auth POSTs).
// We grab an unpatched `fetch` from a freshly created same-origin iframe.

let cached: typeof fetch | null = null;
let iframeRef: HTMLIFrameElement | null = null;
let initPromise: Promise<typeof fetch> | null = null;

export function getNativeFetch(): typeof fetch {
  if (cached) return cached;
  if (typeof window === "undefined") return fetch;

  try {
    // Check if window.fetch is already native (not proxied)
    const fetchStr = window.fetch.toString();
    if (fetchStr.includes("[native code]") || fetchStr.includes("native")) {
      cached = window.fetch.bind(window);
      return cached;
    }
  } catch {
    // ignore
  }

  // If we're still initializing, return the window.fetch for now
  // It will be replaced once the iframe is ready
  if (!cached) {
    initializeNativeFetch();
    cached = window.fetch.bind(window);
  }

  return cached;
}

function initializeNativeFetch() {
  if (initPromise) return;

  initPromise = new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(fetch);
      return;
    }

    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.setAttribute("aria-hidden", "true");
      iframe.setAttribute("sandbox", "allow-same-origin");
      iframe.src = "about:blank";

      const onReady = () => {
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow && iframeWindow.fetch) {
            const nativeFetch = iframeWindow.fetch.bind(iframeWindow);
            cached = nativeFetch;
            iframeRef = iframe;
            resolve(nativeFetch);
            return;
          }
        } catch {
          // ignore
        }

        // Fallback
        cached = window.fetch.bind(window);
        try {
          document.documentElement.removeChild(iframe);
        } catch {
          // ignore
        }
        resolve(cached!);
      };

      iframe.addEventListener("load", onReady, { once: true });

      // Timeout fallback
      const timeoutId = setTimeout(() => {
        onReady();
      }, 500);

      iframe.addEventListener("load", () => clearTimeout(timeoutId), { once: true });

      document.documentElement.appendChild(iframe);
    } catch (error) {
      console.warn("[Supabase Auth] Failed to initialize native fetch:", error);
      cached = window.fetch.bind(window);
      resolve(cached);
    }
  });
}
