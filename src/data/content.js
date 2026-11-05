// Career started 1 March 2008 — copy derives the current tenure from this date
// so the site ages correctly without yearly edits.
export const CAREER_START = '2008-03-01'

export function tenure(now = new Date()) {
  let years = now.getFullYear() - 2008
  let months = now.getMonth() - 2
  let days = now.getDate() - 1
  if (days < 0) {
    months--
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months, days }
}

/** "18 years, 9 months and 14 days" */
export const tenurePhrase = (now) => {
  const t = tenure(now)
  return `${t.years} years, ${t.months} months and ${t.days} days`
}

export const profile = {
  name: 'Bruno Galati',
  role: 'Fullstack Developer · Digital Designer',
  years: tenure().years,
  email: 'brngalati@gmail.com',
  phone: '+34 695 818 210',
  linkedin: 'https://www.linkedin.com/in/brunogalatideveloper/',
  github: 'https://brunobruno.github.io',
  languages: ['English', 'Português', 'Italiano', 'Español', 'Deutsch (learning)'],
}

export const timeline = [
  { year: '2026', place: 'Berlin', org: 'German Federal Ministry', what: 'Public digital services for German institutions, AI-assisted tooling for citizens.', stack: ['React', 'Next', 'Web Components'] },
  { year: '2026', place: 'Barcelona', org: 'Biorce', what: 'Clinical-trial contract negotiation platform: rich editors, DOCX previews, cross-site comments.', stack: ['React', 'C++', 'AI'] },
  { year: '2025', place: 'Barcelona', org: 'Cyber-intelligence', what: 'Secure interfaces for government intelligence and lawful-interception platforms.', stack: ['Angular', 'Python', 'Mapbox'] },
  { year: '2022', place: 'Düsseldorf', org: 'Mvneco', what: 'Led a frontend team shipping CRMs, PWAs and virtual stores.', stack: ['Angular', 'React', 'TypeScript'] },
  { year: '2020', place: 'Cologne', org: 'EASA', what: 'Migrated a two-year-delayed legacy system for the EU aviation agency.', stack: ['Angular', 'Laravel'] },
  { year: '2020', place: 'Rome', org: 'Merck', what: 'Interactive health campaigns and professional portals.', stack: ['React', 'WordPress'] },
  { year: '2019', place: 'Rome', org: 'Lottomatica', what: 'Hybrid lottery app used by millions.', stack: ['Angular', 'Vue', 'Cordova'] },
  { year: '2016', place: 'São Paulo', org: 'Dr.Consulta', what: 'Design system, patient kiosks and medical records for a healthcare network.', stack: ['Angular', 'Vue', 'React', 'Node'] },
  { year: '2014', place: 'São Paulo', org: 'Estadão', what: 'Paywall, social login and video platform for a major newspaper.', stack: ['Angular', 'Laravel'] },
  { year: '2008', place: 'São Paulo', org: 'First pixels', what: 'Graphic design, e-commerce, campaigns — where code met composition.', stack: ['PHP', 'Photoshop', 'Illustrator'] },
]

