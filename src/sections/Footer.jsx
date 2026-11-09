import { motion } from 'framer-motion'
import { Reveal } from '../components/Parallax'
import SeaScene from '../components/SeaScene'
import { profile } from '../data/content'
import './Footer.css'

// silhouettes crossing the water — far ones small/blurred, near ones bigger.
// all paths face RIGHT; --back instances swim left with the sprite flipped.

// fixed bubble field — deterministic so render stays pure
const bubbles = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53 + 11) % 96}%`,
  size: 4 + ((i * 7) % 14),
  dur: 9 + ((i * 5) % 9),
  delay: -((i * 3.7) % 16),
  drift: ((i % 3) - 1) * 30,
}))

export default function Footer() {
  return (
    <footer id="contact" className="footer">
              <div className="footer__waves">
          <svg className="footer__wave footer__wave--back" viewBox="0 0 2880 110" preserveAspectRatio="none">
            <path d="M0,55 C240,15 480,95 720,55 C960,15 1200,95 1440,55 C1680,15 1920,95 2160,55 C2400,15 2640,95 2880,55 L2880,110 L0,110 Z" />
          </svg>
          <svg className="footer__wave footer__wave--front" viewBox="0 0 2880 110" preserveAspectRatio="none">
            <defs>
              <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1e7ea8" stopOpacity="0.55" />
                <stop offset="0.6" stopColor="#0d4258" stopOpacity="0.85" />
                <stop offset="1" stopColor="#0d4258" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path fill="url(#seaGrad)" d="M0,55 C240,15 480,95 720,55 C960,15 1200,95 1440,55 C1680,15 1920,95 2160,55 C2400,15 2640,95 2880,55 L2880,110 L0,110 Z" />
            <path className="footer__wave-crest" d="M0,55 C240,15 480,95 720,55 C960,15 1200,95 1440,55 C1680,15 1920,95 2160,55 C2400,15 2640,95 2880,55" fill="none" />
          </svg>
        </div>
      <div className="footer__sea" aria-hidden>
        {/* the waterline — layered waves replace the straight seam */}
        <div className="footer__rays">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="footer__ray" style={{ '--i': i }} />
          ))}
        </div>
        <div className="footer__caustics" />
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="footer__bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              '--dur': `${b.dur}s`,
              '--delay': `${b.delay}s`,
              '--drift': `${b.drift}px`,
            }}
          />
        ))}
        <SeaScene />
        <div className="footer__depth" />
      </div>
      <div className="container footer__content">
        <Reveal>
          <p className="eyebrow">Let's make something</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display footer__title">
            Bring the
            <br />
            <span className="footer__title-accent">blank canvas.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <motion.a
            className="footer__mail wide"
            href={`mailto:${profile.email}`}
            whileHover={{ scale: 1.03, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            {profile.email}
          </motion.a>
        </Reveal>

        <div className="footer__grid">
          <Reveal delay={0.25}>
            <h3 className="eyebrow">Elsewhere</h3>
            <ul className="footer__list">
              <li>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
              </li>
              <li>
                <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
              </li>
              <li>
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
              </li>
            </ul>
          </Reveal>
          <Reveal delay={0.3}>
            <h3 className="eyebrow">Speaks</h3>
            <ul className="footer__list">
              {profile.languages.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.35}>
            <h3 className="eyebrow">Based</h3>
            <ul className="footer__list">
              <li>Europe · Remote-first</li>
              <li>EU citizen</li>
            </ul>
          </Reveal>
        </div>

        <p className="footer__colophon italic">
          Set in Bebas Neue, Playfair Display, Unbounded & Space Grotesk. Built with React, Framer Motion and a long
          scroll. © {new Date().getFullYear()} {profile.name}.
        </p>
      </div>
    </footer>
  )
}
