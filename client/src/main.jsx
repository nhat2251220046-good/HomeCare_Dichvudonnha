import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
  import { ClerkProvider } from '@clerk/clerk-react'
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from './components/ScrollToTop.jsx'
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const Root = (
  <BrowserRouter>
    <ScrollToTop>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ScrollToTop>
  </BrowserRouter>
)

if (PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'REPLACE_ME') {
  createRoot(document.getElementById('root')).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{Root}</ClerkProvider>
  )
} else {
  console.warn('Clerk publishable key missing or placeholder. Running without Clerk.');
  createRoot(document.getElementById('root')).render(Root)
}
