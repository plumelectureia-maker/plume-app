import './app.js';

// Service worker : Plume démarre et se lit sans connexion (en production seulement).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then((reg) => {
      const urls = ['/'].concat([].slice.call(document.querySelectorAll('script[src],link[rel=stylesheet][href]')).map((el) => el.getAttribute('src') || el.getAttribute('href')))
        .filter((u) => u && u.charAt(0) === '/');
      if (reg.active) reg.active.postMessage({ type: 'warm', urls });
    }).catch(() => {});
  });
}
