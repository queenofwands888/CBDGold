import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/hf-style.css'
import ErrorBoundary from './components/ErrorBoundary'

if (import.meta.env.PROD && window.location.protocol === 'http:') {
  window.location.href = window.location.href.replace('http:', 'https:');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
