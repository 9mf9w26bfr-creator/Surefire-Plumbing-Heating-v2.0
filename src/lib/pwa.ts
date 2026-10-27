/**
 * PWA Service Worker Registration & Install Prompt
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[PWA SW Registration Notice]', err);
      });
    });
  }
}
