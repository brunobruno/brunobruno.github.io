import Vortex from './sections/Vortex'
import JobsGlobe from './sections/JobsGlobe'
import Gears from './sections/Gears'
import Fog from './sections/Fog'
import Footer from '../sections/Footer'
import './experimental.css'

/**
 * The "Experimental" playground: self-contained toys that exist purely to
 * entertain. Each slide owns its own scene; there is no shared data layer.
 */
export default function ExperimentalView() {
  return (
    <div className="xp">
      <main>
        <Vortex />
        <JobsGlobe />
        <Gears />
        <Fog />
      </main>
      <Footer />
    </div>
  )
}
