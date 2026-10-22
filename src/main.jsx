import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

// NOTE: no <StrictMode> — its simulated unmount runs react-globe.gl's
// destructor (empties the Three.js scene, disposes the renderer) while the
// same kapsule instance stays mounted, leaving a permanently blank globe
// in dev. The portfolio is a single-purpose page, so the trade-off is fine.
createRoot(document.getElementById('root')).render(<App />)
