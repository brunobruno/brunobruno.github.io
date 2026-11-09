import { motion } from 'framer-motion'
import { Reveal } from '../components/Parallax'
import SeaScene from '../components/SeaScene'
import { profile } from '../data/content'
import './Footer.css'

// fish crossing the water — far ones small/blurred, near ones bigger
const fish = Array.from({ length: 5 }, (_, i) => ({
  top: `${14 + i * 15}%`,
  size: 60 + ((i * 29) % 90),
  dur: 46 + ((i * 13) % 30),
  delay: -((i * 11) % 50),
  dir: i % 2 === 0 ? 1 : -1,
  blur: i < 2 ? 2.5 : i < 4 ? 1 : 0,
}))

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
      <div className="footer__sea" aria-hidden>
        {/* the waterline — layered waves replace the straight seam */}
        <div className="footer__waves">
          <svg className="footer__wave footer__wave--back" viewBox="0 0 2880 110" preserveAspectRatio="none">
            <path d="M0,55 C240,15 480,95 720,55 C960,15 1200,95 1440,55 C1680,15 1920,95 2160,55 C2400,15 2640,95 2880,55 L2880,110 L0,110 Z" />
          </svg>
          <svg className="footer__wave footer__wave--front" viewBox="0 0 2880 110" preserveAspectRatio="none">
            <path d="M0,55 C240,15 480,95 720,55 C960,15 1200,95 1440,55 C1680,15 1920,95 2160,55 C2400,15 2640,95 2880,55 L2880,110 L0,110 Z" />
            <path className="footer__wave-crest" d="M0,55 C240,15 480,95 720,55 C960,15 1200,95 1440,55 C1680,15 1920,95 2160,55 C2400,15 2640,95 2880,55" fill="none" />
          </svg>
        </div>
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
        {fish.map((f, i) => (
          <span
            key={i}
            className={`footer__fish${f.dir === -1 ? ' footer__fish--back' : ''}`}
            style={{
              top: f.top,
              width: f.size,
              '--dur': `${f.dur}s`,
              '--delay': `${f.delay}s`,
              filter: `blur(${f.blur}px)`,
            }}
          >
            <svg viewBox="0 0 42 14" aria-hidden>
              <path d="M2 7 Q12 0 24 3.5 L41 7 L24 10.5 Q12 14 2 7 Z M24 3.5 L33 0 L30.5 4 L33 7 L30.5 10 L33 14 L24 10.5 Z" />
            </svg>
          </span>
        ))}
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
