import { createContext, useContext, useEffect, useState } from "react";

const settingsKey = "globalSettings"

interface Settings {
  alsoShareLink: boolean
}

const defaultSettings: Settings = {
  alsoShareLink: false
} as const

interface ISettingsContext {
  value: Settings
  update: (partialSettings: Partial<Settings>) => void
}

const loadSettings = (): Settings => {
  const rawSettings = localStorage.getItem(settingsKey)
  if (rawSettings) {
    let save = JSON.parse(rawSettings)
    return save
  }
  return { ...defaultSettings }
}

const saveSettings = (settings: Settings) => {
  if (settings) localStorage.setItem( settingsKey, JSON.stringify(settings) )
}

export const SettingsContext = createContext<ISettingsContext>({
  value: loadSettings(),
  update: (partialSettings: Partial<Settings>) => {
    saveSettings({ ...loadSettings(), ...partialSettings })
  }
})

const SettingsProvider = ({children}: any) => {
  const [settings, setSettings] = useState(loadSettings())

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  return (
    <SettingsContext.Provider value={{
      value: settings,
      update: (partialSettings: Partial<Settings>) => {
        setSettings({ ...settings, ...partialSettings })
      }
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsProvider

export const useSettings = () => {
  const settings = useContext(SettingsContext)
  if (!settings) console.error("Cannot useAuth outside of AuthProvider");
  return settings!
}
