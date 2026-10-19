'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  changeVolume: (v: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const tracks: Record<string, string> = {
  '/': '/audio/the_mountain-dance-pop-246718.mp3',
  '/checkout': '/audio/paulyudin-dance-house-pop-waiting-for-you-475318.mp3',
  '/sucesso': '/audio/jonasblakewood-pop-dance-pop-dance-music-445891.mp3',
  default: '/audio/djdoblina-dance-until-dark-329026.mp3',
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1); // 10% inicial
  const [isMuted, setIsMuted] = useState(false);

  // Inicializa o áudio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
  }, []);

  // Troca a música quando muda de página
  useEffect(() => {
    if (!audioRef.current) return;

    let trackUrl = tracks[pathname];
    
    // Se a rota for dinâmica (ex: /produto/123), usa o default
    if (!trackUrl) {
      if (pathname.startsWith('/produto') || pathname.startsWith('/carrinho') || pathname.startsWith('/admin')) {
        trackUrl = tracks.default;
      } else {
        trackUrl = tracks.default;
      }
    }

    audioRef.current.src = trackUrl;
    
    // Se já estava tocando, continua tocando a nova música
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [pathname, isPlaying]);

  // Ajusta o volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log('Autoplay bloqueado', e));
    }
  };

  const toggleMute = () => setIsMuted((prev) => !prev);
  const changeVolume = (v: number) => {
    setVolume(v);
    if (v > 0 && isMuted) setIsMuted(false);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, volume, isMuted, togglePlay, toggleMute, changeVolume }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio precisa estar dentro de AudioProvider');
  return ctx;
}
