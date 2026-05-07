import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { ThemeProvider } from '@zoom-out/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" forcedTheme="dark" attribute="class">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
