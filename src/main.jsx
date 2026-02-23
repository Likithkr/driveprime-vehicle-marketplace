import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FlagsProvider } from './context/FlagsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlagsProvider>
      <App />
    </FlagsProvider>
  </StrictMode>,
)
