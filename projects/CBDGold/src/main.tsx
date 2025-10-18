import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/tailwind.css'
import './styles/App.css'
import { AppProviders } from './providers'

if (import.meta.env.PROD && window.location.protocol === 'http:') {
  window.location.href = window.location.href.replace('http:', 'https:');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
