import React, { useState, useEffect } from 'react';

interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoSaveEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  animationsEnabled: boolean;
}

const SETTINGS_KEY = 'minibeasts_settings';

const defaultSettings: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  autoSaveEnabled: true,
  difficulty: 'normal',
  animationsEnabled: true
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
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  resetSettings(): void {
    localStorage.removeItem(SETTINGS_KEY);
  }
};

export const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings>(settingsService.getSettings());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    // Save settings whenever they change
    settingsService.saveSettings(settings);
  }, [settings]);

  const handleReset = () => {
    settingsService.resetSettings();
    setSettings(defaultSettings);
    setShowResetConfirm(false);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border-2 border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Audio Section */}
          <section>
            <h3 className="text-xl font-semibold text-slate-200 mb-4">🔊 Audio</h3>
            <div className="space-y-3">
              <SettingToggle
                label="Sound Effects"
                description="Play sound effects during gameplay"
                enabled={settings.soundEnabled}
                onChange={(enabled) => updateSetting('soundEnabled', enabled)}
              />
              <SettingToggle
                label="Background Music"
                description="Play background music"
                enabled={settings.musicEnabled}
                onChange={(enabled) => updateSetting('musicEnabled', enabled)}
              />
            </div>
          </section>

          {/* Game Settings */}
          <section>
            <h3 className="text-xl font-semibold text-slate-200 mb-4">🎮 Gameplay</h3>
            <div className="space-y-3">
              <SettingToggle
                label="Auto-Save"
                description="Automatically save your progress"
                enabled={settings.autoSaveEnabled}
                onChange={(enabled) => updateSetting('autoSaveEnabled', enabled)}
              />
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Affects minigame challenge and stat drain rates
                </p>
                <div className="flex gap-2">
                  {(['easy', 'normal', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateSetting('difficulty', level)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                        settings.difficulty === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Display Settings */}
          <section>
            <h3 className="text-xl font-semibold text-slate-200 mb-4">🎨 Display</h3>
            <div className="space-y-3">
              <SettingToggle
                label="Animations"
                description="Enable smooth transitions and animations"
                enabled={settings.animationsEnabled}
                onChange={(enabled) => updateSetting('animationsEnabled', enabled)}
              />
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-xl text-red-400 font-medium transition-all"
              >
                Reset All Settings
              </button>
            ) : (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
                <p className="text-sm text-red-300 mb-3">
                  Are you sure? This will reset all settings to default values.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingToggle: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, description, enabled, onChange }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200">{label}</div>
        <div className="text-xs text-slate-400 mt-1">{description}</div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
