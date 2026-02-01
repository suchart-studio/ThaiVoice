
import React, { useState, useRef, useCallback } from 'react';
import { VoiceType, VoiceTone, TTSSettings, AudioState } from './types';
import SettingsPanel from './components/SettingsPanel';
import { generateThaiSpeech } from './services/geminiTTS';
import { decode, decodeAudioData } from './utils/audioUtils';

const App: React.FC = () => {
  const [settings, setSettings] = useState<TTSSettings>({
    text: '',
    voice: VoiceType.FEMALE,
    tone: VoiceTone.FORMAL,
    speed: 1.0,
  });

  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isGenerating: false,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleUpdateSettings = useCallback((updates: Partial<TTSSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodeRef.current = null;
    }
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const playSpeech = async () => {
    if (!settings.text.trim()) {
      setAudioState(prev => ({ ...prev, error: 'กรุณากรอกข้อความที่ต้องการแปลง' }));
      return;
    }

    setAudioState(prev => ({ ...prev, isGenerating: true, error: null, isPlaying: false }));
    stopAudio();

    try {
      const base64Data = await generateThaiSpeech(settings);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBytes = decode(base64Data);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = settings.speed;
      
      const gainNode = ctx.createGain();
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.onended = () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      };

      source.start(0);
      sourceNodeRef.current = source;
      setAudioState(prev => ({ ...prev, isPlaying: true, isGenerating: false }));

    } catch (err: any) {
      console.error(err);
      setAudioState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI' 
      }));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thai Voice Studio</h1>
          <p className="text-slate-500 font-medium">แปลงข้อความเป็นเสียงคุณภาพสูงด้วย Gemini AI</p>
        </header>

        {/* Text Input Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <textarea
            className="w-full h-48 md:h-64 p-6 text-lg text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-0"
            placeholder="พิมพ์หรือวางข้อความภาษาไทยที่นี่..."
            value={settings.text}
            onChange={(e) => handleUpdateSettings({ text: e.target.value })}
            disabled={audioState.isGenerating}
          />
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>{settings.text.length} ตัวอักษร</span>
            <span>รองรับภาษาไทยเท่านั้น</span>
          </div>
        </div>

        {/* Controls */}
        <SettingsPanel 
          settings={settings} 
          onUpdate={handleUpdateSettings} 
          disabled={audioState.isGenerating}
        />

        {/* Error Message */}
        {audioState.error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {audioState.error}
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {!audioState.isPlaying ? (
            <button
              onClick={playSpeech}
              disabled={audioState.isGenerating || !settings.text}
              className={`group relative flex items-center justify-center gap-3 px-12 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                audioState.isGenerating || !settings.text
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {audioState.isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>กำลังสร้างเสียง...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>แปลงเป็นเสียง</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopAudio}
              className="flex items-center justify-center gap-3 px-12 py-4 bg-rose-500 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 hover:bg-rose-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
              </svg>
              <span>หยุดเล่น</span>
            </button>
          )}
        </div>

        {/* Visualizer Placeholder */}
        {audioState.isPlaying && (
          <div className="flex justify-center items-center gap-1 h-12">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-indigo-400 rounded-full animate-bounce"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        )}

        {/* Footer info */}
        <footer className="pt-12 text-center">
          <p className="text-slate-400 text-sm">
            Powered by <span className="font-bold text-indigo-400">Gemini 2.5 Flash</span> Native TTS Technology
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
