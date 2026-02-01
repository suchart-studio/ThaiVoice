
import React from 'react';
import { VoiceType, VoiceTone, TTSSettings } from '../types';

interface SettingsPanelProps {
  settings: TTSSettings;
  onUpdate: (updates: Partial<TTSSettings>) => void;
  disabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, disabled }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">เลือกเพศเสียง</label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ voice: VoiceType.FEMALE })}
            disabled={disabled}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              settings.voice === VoiceType.FEMALE
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } disabled:opacity-50`}
          >
            ผู้หญิง
          </button>
          <button
            onClick={() => onUpdate({ voice: VoiceType.MALE })}
            disabled={disabled}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              settings.voice === VoiceType.MALE
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } disabled:opacity-50`}
          >
            ผู้ชาย
          </button>
        </div>
      </div>

      {/* Tone Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">โทนเสียง</label>
        <div className="flex flex-wrap gap-2">
          {Object.values(VoiceTone).map((tone) => (
            <button
              key={tone}
              onClick={() => onUpdate({ tone })}
              disabled={disabled}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                settings.tone === tone
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              } disabled:opacity-50`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-slate-700">ความเร็ว</label>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            {settings.speed}x
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.speed}
          onChange={(e) => onUpdate({ speed: parseFloat(e.target.value) })}
          disabled={disabled}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>ช้า</span>
          <span>ปกติ</span>
          <span>เร็ว</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
