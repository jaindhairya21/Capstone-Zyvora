import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Sync dark mode with system preference immediately (before first render)
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
}

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
applyTheme(mediaQuery.matches);
mediaQuery.addEventListener('change', (e) => applyTheme(e.matches));

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)