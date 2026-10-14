import { motion } from 'framer-motion'
import { Reveal } from '../components/Parallax'
import { profile } from '../data/content'
import './Footer.css'

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer__klein" />
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
