// Returns a fetch implementation that bypasses any monkey-patched window.fetch
// (e.g. the Lovable preview iframe injects a proxy that breaks Supabase auth POSTs).
// We grab an unpatched `fetch` from a freshly created same-origin iframe.

let cached: typeof fetch | null = null;

export function getNativeFetch(): typeof fetch {
  if (cached) return cached;
  if (typeof window === "undefined") return fetch;

  try {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    // about:blank is same-origin and gives us a clean window with pristine fetch
    iframe.src = "about:blank";
    document.documentElement.appendChild(iframe);

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis;
    const nativeFetch = iframeWindow?.fetch?.bind(iframeWindow);

    if (nativeFetch) {
      cached = nativeFetch;
      return nativeFetch;
    }
  } catch {
    // fall through
  }

  cached = window.fetch.bind(window);
  return cached;
}
