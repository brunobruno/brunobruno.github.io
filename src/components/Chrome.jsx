import { motion, useScroll, useSpring } from 'framer-motion'
import './Chrome.css'

const chapters = [
  ['hero', 'Manifesto'],
  ['cave', 'Origins'],
  ['perspective', 'Depth'],
  ['destijl', 'Structure'],
  ['opart', 'Perception'],
  ['suprematism', 'Direction'],
  ['velocity', 'Speed'],
  ['pop', 'Repetition'],
  ['rothko', 'Reflection'],
  ['machine', 'Intelligence'],
  ['contact', 'Contact'],
]

export default function Chrome() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <>
      <motion.div className="chrome__progress" style={{ scaleX }} />
      <nav className="chrome__nav" aria-label="Chapters">
        {chapters.map(([id, label], i) => (
          <a key={id} href={`#${id}`} className="chrome__dot">
            <span className="chrome__num">{String(i + 1).padStart(2, '0')}</span>
            <span className="chrome__label">{label}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
