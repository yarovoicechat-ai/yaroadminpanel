'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Audio30SecRecorderProps {
  label?: string;
  value?: string;
  onChange: (base64AudioUrl: string) => void;
  required?: boolean;
}

export function Audio30SecRecorder({ label = "Host Voice Sample (30 Seconds Max)", value, onChange, required }: Audio30SecRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // seconds (max 30)
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(value || null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (value && value !== audioUrl) {
      setAudioUrl(value);
    }
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          onChange(base64data);
        };

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Start 30s timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      setHasPermission(false);
      toast.error('Microphone access denied or unavailable. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlay = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleReset = () => {
    stopRecording();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setIsPlaying(false);
    setAudioUrl(null);
    setRecordingTime(0);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-white/90 flex items-center justify-between">
        <span>{label} {required && '*'}</span>
        <span className="text-[11px] text-amber-300 font-mono">Max 30 Seconds</span>
      </label>

      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-3">
        {/* Hidden Audio Player */}
        {audioUrl && (
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* State 1: Recording Mode */}
        {isRecording ? (
          <div className="flex items-center justify-between bg-rose-900/40 border border-rose-500/40 rounded-xl p-3 text-white">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div>
                <p className="text-xs font-bold text-rose-200">Recording Voice Sample...</p>
                <p className="text-[11px] text-rose-300 font-mono">{recordingTime}s / 30s</p>
              </div>
            </div>

            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop
            </button>
          </div>
        ) : audioUrl ? (
          /* State 2: Recorded Audio Preview & Playback */
          <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/40 rounded-xl p-3 text-white">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-200">Voice Recorded (30s Max)</p>
                <p className="text-[11px] text-emerald-300/80">Ready for submission</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all border border-white/30"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition-all border border-rose-500/30"
                title="Re-record Audio"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-record
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Ready to Record Initial Button */
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/30 rounded-xl hover:border-amber-400/60 transition-all text-center gap-2 bg-white/5">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Record 30-Second Voice Sample</p>
              <p className="text-[11px] text-white/70">Click Record, speak into your mic, and it will stop automatically at 30s.</p>
            </div>
            <button
              type="button"
              onClick={startRecording}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
            >
              <Mic className="w-4 h-4" /> Start Recording (30s)
            </button>
          </div>
        )}

        {hasPermission === false && (
          <div className="text-[11px] text-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Please allow microphone access in your browser settings.
          </div>
        )}
      </div>
    </div>
  );
}
