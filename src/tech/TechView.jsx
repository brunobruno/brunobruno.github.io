import { useEffect, useState } from 'react'
import { WorldContext } from './world'
import Starfield from './components/Starfield'
import Evolution from './sections/Evolution'
import Earth from './sections/Earth'
import Backend from './sections/Backend'
import Technology from './sections/Technology'
import Population from './sections/Population'
import Deploy from './sections/Deploy'
import Footer from '../sections/Footer'
import { loadWorldData } from './data/worldbank'
import './tech.css'

/**
 * The "Tech" parallax: a journey from the evolution of tools, out to the
 * planet (live World Bank data on an interactive globe), through backend systems,
 * technology and people, and finally to the deploy.
 *
 * One starfield canvas sits behind every slide so the whole view reads as a
 * single continuous flight through space.
 */
export default function TechView() {
  const [state, setState] = useState({ data: null, error: null })

  useEffect(() => {
    let alive = true
    loadWorldData()
      .then((data) => alive && setState({ data, error: null }))
      .catch((error) => alive && setState({ data: null, error }))
    return () => {
      alive = false
    }
  }, [])

  return (
    <WorldContext.Provider value={state}>
      <div className="tech">
        <Starfield />
        <main className="tech__main">
          <Evolution />
          <Earth />
          <Backend />
          <Technology />
          <Population />
          <Deploy />
        </main>
        <Footer />
      </div>
    </WorldContext.Provider>
  )
}
