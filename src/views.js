/**
 * The two parallax worlds. `chapters` feed the side navigation; ids must match
 * the section ids rendered by each view.
 */
export const VIEWS = {
  design: {
    label: 'Design',
    chapters: [
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
    ],
  },
  tech: {
    label: 'Tech',
    chapters: [
      ['evolution', 'Evolution'],
      ['earth', 'Earth'],
      ['money', 'Capital'],
      ['technology', 'Technology'],
      ['population', 'People'],
      ['moon', 'Moon'],
      ['contact', 'Contact'],
    ],
  },
  experimental: {
    label: 'Experimental',
    chapters: [
      ['vortex', 'Vortex'],
      ['jobs', 'Openings'],
      ['gears', 'Gears'],
      ['fog', 'Fog'],
      ['contact', 'Contact'],
    ],
  },
}

export const readView = () => {
  const v = new URLSearchParams(window.location.search).get('view')
  return v in VIEWS ? v : 'design'
}
