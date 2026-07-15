/**
 * Givebutter embed height auto-resizer.
 *
 * Givebutter's embed sends postMessage events with height info.
 * This listens for those messages and resizes the matching iframe.
 */
export function initGivebutterResizer() {
  const handler = (event) => {
    // Givebutter embeds come from givebutter.com
    if (!event.origin?.includes("givebutter.com")) return;

    let data;
    try {
      data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }

    // Givebutter sends height via { type: "resize", height: number }
    if (data?.type === "resize" && typeof data.height === "number") {
      const iframes = document.querySelectorAll('iframe[src*="givebutter.com/embed"]');
      for (const iframe of iframes) {
        if (iframe.contentWindow === event.source) {
          iframe.style.height = data.height + "px";
          break;
        }
      }
    }
  };

  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}