import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';

const AudioRecorder = ({ questionId, recordings, setRecordings }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const recording = recordings[questionId];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings(prev => ({ ...prev, [questionId]: { url: audioUrl, duration: recordingTime, blob: audioBlob } }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch {
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playRecording = () => { if (recording && audioRef.current) { audioRef.current.play(); setIsPlaying(true); } };
  const pauseRecording = () => { if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); } };
  const deleteRecording = () => {
    if (recording) {
      URL.revokeObjectURL(recording.url);
      setRecordings(prev => { const n = { ...prev }; delete n[questionId]; return n; });
      setPlaybackTime(0);
    }
  };

  useEffect(() => {
    if (recording) {
      audioRef.current = new Audio(recording.url);
      audioRef.current.onended = () => { setIsPlaying(false); setPlaybackTime(0); };
      audioRef.current.ontimeupdate = () => setPlaybackTime(Math.floor(audioRef.current.currentTime));
    }
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, [recording]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <Volume2 size={16} className="text-gray-400" />
      {!recording ? (
        isRecording ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 font-medium">녹음 중... {formatTime(recordingTime)}</span>
            <button onClick={stopRecording} className="ml-auto p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Square size={16} /></button>
          </div>
        ) : (
          <button onClick={startRecording} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-600">
            <Mic size={16} />내 답변 녹음하기
          </button>
        )
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <button onClick={isPlaying ? pauseRecording : playRecording} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1"><span>{formatTime(playbackTime)}</span><span>{formatTime(recording.duration)}</span></div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${recording.duration > 0 ? (playbackTime / recording.duration) * 100 : 0}%` }} />
            </div>
          </div>
          <button onClick={deleteRecording} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
