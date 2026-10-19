'use client';

import { useAudio } from '@/context/AudioContext';

export default function AudioPlayer() {
  const { isPlaying, volume, isMuted, togglePlay, toggleMute, changeVolume } = useAudio();

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-white border-2 border-gray-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-3">
      {/* Botão Play/Pause */}
      <button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-orange-500 transition"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      {/* Controle de Volume */}
      <div className="flex items-center gap-2">
        <button onClick={toggleMute} className="text-gray-600 hover:text-black">
          {isMuted || volume === 0 ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v6a3 3 0 0 0 3 3h.5"></path><path d="M15 9.34V4a2 2 0 0 0-2.83-1.73l-3.45 1.74"></path><path d="M16.72 11.06a7 7 0 0 1 1.28 3.94"></path><path d="M20.23 7.61a11 11 0 0 1 1.77 8.1"></path><line x1="9" y1="9" x2="9" y2="15"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          )}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume} 
          onChange={(e) => changeVolume(Number(e.target.value))}
          className="w-20 accent-black cursor-pointer"
        />
      </div>
    </div>
  );
}
