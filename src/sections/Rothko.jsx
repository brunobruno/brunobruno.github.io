import { motion, useTransform } from 'framer-motion'
import { ParallaxSection } from '../components/Parallax'
import './Rothko.css'

const lines = [
  'Art is not decoration.',
  'It is how a species rehearses the future',
  'before it has the courage to build it.',
]

export default function Rothko() {
  return (
    <ParallaxSection id="rothko" className="rothko">
      {(p) => <Inner p={p} />}
    </ParallaxSection>
  )
}

function Inner({ p }) {
  const topY = useTransform(p, [0, 1], ['-12%', '12%'])
  const botY = useTransform(p, [0, 1], ['12%', '-12%'])
  const glow = useTransform(p, [0.2, 0.5, 0.8], [0.2, 1, 0.2])
  return (
    <>
      <motion.div className="rothko__field rothko__field--top" style={{ y: topY }} />
      <motion.div className="rothko__field rothko__field--bottom" style={{ y: botY }} />
      <motion.div className="rothko__glow" style={{ opacity: glow }} />

      <div className="container rothko__content">
        <p className="eyebrow rothko__eyebrow">Colour field, 1950s · an interlude</p>
        {lines.map((l, i) => (
          <motion.p
            key={l}
            className={i === 0 ? 'display rothko__big' : 'serif rothko__line'}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.4, delay: i * 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {l}
          </motion.p>
        ))}
      </div>
    </>
  )
}
