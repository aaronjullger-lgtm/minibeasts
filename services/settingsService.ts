export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoSaveEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  animationsEnabled: boolean;
  notifications: boolean;
  keyboardShortcuts: boolean;
}

const SETTINGS_KEY = 'minibeasts_settings';

export const defaultSettings: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  autoSaveEnabled: true,
  difficulty: 'normal',
  animationsEnabled: true,
  notifications: true,
  keyboardShortcuts: true
};

export const settingsService = {
  getSettings(): Settings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (!stored) return defaultSettings;
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return defaultSettings;
    }
  },

  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      // Dispatch event so other components can react to settings changes
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    const current = this.getSettings();
    this.saveSettings({ ...current, [key]: value });
  },

  resetSettings(): void {
    localStorage.removeItem(SETTINGS_KEY);
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: defaultSettings }));
  },

  // Helper to get difficulty multiplier
  getDifficultyMultiplier(): number {
    const settings = this.getSettings();
    switch (settings.difficulty) {
      case 'easy':
        return 0.75;
      case 'hard':
        return 1.5;
      case 'normal':
      default:
        return 1.0;
    }
  },

  // Helper to check if sound should play
  shouldPlaySound(): boolean {
    return this.getSettings().soundEnabled;
  },

  // Helper to check if animations should run
  shouldAnimate(): boolean {
    return this.getSettings().animationsEnabled;
  }
};
