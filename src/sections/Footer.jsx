import { motion } from 'framer-motion'
import { Reveal } from '../components/Parallax'
import SeaScene from '../components/SeaScene'
import { profile } from '../data/content'
import './Footer.css'

// silhouettes crossing the water — far ones small/blurred, near ones bigger.
// all paths face RIGHT; --back instances swim left with the sprite flipped.
const FISH_PATHS = {
  fish: 'M8 10 C16 2 34 0 48 7 L62 10 L48 13 C34 20 16 18 8 10 Z M8 10 L-4 2 L1 10 L-4 18 Z',
  shark: 'M4 11 C14 4 34 2 50 7 L64 10 L50 13 C36 18 16 17 4 11 Z M30 4 L39 0 L34 4 L39 8 L30 8 Z M50 7 L61 2 L58 8 L61 16 L50 13 Z',
  whale: 'M2 12 C10 4 34 2 52 8 L66 11 L52 14 C34 21 12 20 2 12 Z M52 8 L64 2 L61 9 L64 19 L52 14 Z',
}
const fish = [
  { kind: 'whale', top: '68%', size: 210, dur: 95, delay: -30, dir: -1, blur: 2 },
  { kind: 'shark', top: '30%', size: 150, dur: 60, delay: -12, dir: 1, blur: 0.6 },
  { kind: 'fish', top: '52%', size: 90, dur: 44, delay: -40, dir: -1, blur: 1.2 },
  { kind: 'shark', top: '18%', size: 110, dur: 74, delay: -55, dir: -1, blur: 2 },
  { kind: 'fish', top: '80%', size: 70, dur: 38, delay: -8, dir: 1, blur: 0 },
  { kind: 'fish', top: '40%', size: 55, dur: 52, delay: -25, dir: 1, blur: 1.8 },
]

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
                <stop offset="0" stopColor="#1a6a8a" />
                <stop offset="0.55" stopColor="#0d4258" />
                <stop offset="1" stopColor="#0d4258" />
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
            <svg viewBox="-8 0 76 22" aria-hidden>
              <path d={FISH_PATHS[f.kind]} />
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
