import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BDHomepage from './components/BDHomepage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BDHomepage />
  </StrictMode>,
)
