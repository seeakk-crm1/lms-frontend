import React, { useState } from 'react';
import { Play, Pause, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { getRecordingPlayback } from '../../services/telephony.api';

interface RecordingPlayerProps {
  sessionId: string;
  duration?: number;
  compact?: boolean;
}

const RecordingPlayer: React.FC<RecordingPlayerProps> = ({ sessionId, duration, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleTogglePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      void audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getRecordingPlayback(sessionId);
      if (res.recordingAvailable && res.url) {
        setAudioUrl(res.url);
        const audio = new Audio(res.url);
        audioRef.current = audio;

        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setError('Failed to stream audio file.');
          setIsPlaying(false);
        };

        await audio.play();
        setIsPlaying(true);
      } else {
        setError('Recording unavailable.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Recording access denied or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const formatSecs = (sec?: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 ${compact ? 'py-0.5' : 'p-2 bg-slate-50 border border-slate-200 rounded-xl'}`}>
      <button
        onClick={handleTogglePlay}
        disabled={loading}
        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center"
        title={isPlaying ? 'Pause' : 'Play Recording'}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={14} />
        ) : (
          <Play size={14} />
        )}
      </button>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Volume2 size={14} className="text-slate-400" />
          <span>{isPlaying ? 'Playing...' : 'Call Recording'}</span>
          <span className="text-[10px] text-slate-400 font-mono">({formatSecs(duration)})</span>
        </div>

        {error && (
          <span className="text-[10px] text-rose-600 flex items-center gap-1">
            <AlertCircle size={10} /> {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default RecordingPlayer;
