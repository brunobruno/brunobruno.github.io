import Chrome from './components/Chrome'
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

export default function App() {
  return (
    <>
      <Chrome />
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
