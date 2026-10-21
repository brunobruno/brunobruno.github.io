import { createContext, useContext } from 'react'

/** Shared World Bank dataset for the Tech view: { data, error }. Provided by TechView. */
export const WorldContext = createContext({ data: null, error: null })
export const useWorld = () => useContext(WorldContext)
