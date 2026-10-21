import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Chrome from './components/Chrome'
import ViewSwitcher from './components/ViewSwitcher'
import Hero from './sections/Hero'
import Cave from './sections/Cave'
import Perspective from './sections/Perspective'
import DeStijl from './sections/DeStijl'
import OpArt from './sections/OpArt'
import Suprematism from './sections/Suprematism'
import Velocity from './sections/Velocity'
import Pop from './sections/Pop'
import Rothko from './sections/Rothko'
import Machine from './sections/Machine'
import Footer from './sections/Footer'
import { VIEWS, readView } from './views'

// The Tech view pulls in three.js + globe.gl, so it is code-split and only
// downloaded when the visitor flips the switch.
const TechView = lazy(() => import('./tech/TechView'))

function DesignView() {
  return (
    <>
      <main>
        <Hero />
        <Cave />
        <Perspective />
        <DeStijl />
        <OpArt />
        <Suprematism />
        <Velocity />
        <Pop />
        <Rothko />
        <Machine />
      </main>
      <Footer />
    </>
  )
}

// opacity + y only: a lingering `filter`/`scale` on the wrapper would make it a
// containing block and break the fixed starfield / sticky stages inside.
const swap = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.4, ease: 'easeIn' } },
}

export default function App() {
  const [view, setViewState] = useState(readView)

  const setView = useCallback((next) => {
    if (next === view) return
    const url = new URL(window.location.href)
    if (next === 'design') url.searchParams.delete('view')
    else url.searchParams.set('view', next)
    url.hash = ''
    window.history.pushState({ view: next }, '', url)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setViewState(next)
  }, [view])

  useEffect(() => {
    const onPop = () => setViewState(readView())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.view = view
  }, [view])

  return (
    <>
      <ViewSwitcher view={view} onChange={setView} />
      <Chrome chapters={VIEWS[view].chapters} />
      <AnimatePresence mode="wait">
        <motion.div key={view} variants={swap} initial="initial" animate="animate" exit="exit">
          {view === 'design' ? (
            <DesignView />
          ) : (
            <Suspense fallback={<div className="view-loading" aria-busy="true"><span>Loading the universe…</span></div>}>
              <TechView />
            </Suspense>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
