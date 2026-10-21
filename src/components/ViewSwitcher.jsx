import { motion } from 'framer-motion'
import './ViewSwitcher.css'

const options = [
  ['design', 'Design'],
  ['tech', 'Tech'],
]

/** Fixed pill at the top of the page that swaps between the two parallax worlds. */
export default function ViewSwitcher({ view, onChange }) {
  return (
    <motion.div
      className="switcher"
      role="tablist"
      aria-label="Portfolio view"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {options.map(([id, label]) => {
        const active = id === view
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`switcher__btn${active ? ' is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            {active && (
              <motion.span
                layoutId="switcher-pill"
                className="switcher__pill"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="switcher__label">{label}</span>
          </button>
        )
      })}
    </motion.div>
  )
}
