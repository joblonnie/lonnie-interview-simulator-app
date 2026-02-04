import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle, Download } from 'lucide-react';

const AudioRecorder = ({ questionId, recordings, setRecordings }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const recordingTimeRef = useRef(0);

  const recording = recordings[questionId];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setSpeechSupported(false);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      transcriptRef.current = '';
      recordingTimeRef.current = 0;
      setInterimText('');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let finalTranscript = '', interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalTranscript += transcript + ' ';
            else interim += transcript;
          }
          if (finalTranscript) transcriptRef.current += finalTranscript;
          setInterimText(interim);
        };
        recognition.onerror = () => {};
        recognition.onend = () => { if (mediaRecorderRef.current?.state === 'recording') try { recognition.start(); } catch {} };
        recognitionRef.current = recognition;
        try { recognition.start(); } catch {}
      }

      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
        setRecordings(prev => ({ ...prev, [questionId]: { url: audioUrl, duration: recordingTimeRef.current, blob: audioBlob, transcript: transcriptRef.current.trim() || null } }));
        stream.getTracks().forEach(track => track.stop());
        setInterimText('');
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => { recordingTimeRef.current += 1; setRecordingTime(prev => prev + 1); }, 1000);
    } catch { alert('마이크 접근 권한이 필요합니다.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    }
  };

  const playRecording = () => { if (recording && audioRef.current) { audioRef.current.play(); setIsPlaying(true); } };
  const pauseRecording = () => { if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); } };
  const deleteRecording = () => { if (recording) { URL.revokeObjectURL(recording.url); setRecordings(prev => { const n = { ...prev }; delete n[questionId]; return n; }); setPlaybackTime(0); } };
  const downloadRecording = () => { if (recording?.blob) { const url = URL.createObjectURL(recording.blob); const a = document.createElement('a'); a.href = url; a.download = `recording.webm`; a.click(); URL.revokeObjectURL(url); } };

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
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--cloud)', border: '1px solid var(--orchid)' }}>
        <Volume2 size={14} style={{ color: 'var(--orchid-dark)' }} />
        {!recording ? (
          isRecording ? (
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-red-600">녹음 중 {formatTime(recordingTime)}</span>
                <button onClick={stopRecording} className="ml-auto p-1.5 bg-red-500 text-white rounded hover:bg-red-600"><Square size={14} /></button>
              </div>
              {(transcriptRef.current || interimText) && (
                <div className="text-xs bg-white rounded p-2" style={{ color: 'var(--text-mid)', border: '1px solid var(--orchid)' }}>
                  {transcriptRef.current}<span style={{ color: 'var(--text-light)' }}>{interimText}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <button onClick={startRecording} className="flex items-center gap-1.5 px-2.5 py-1.5 text-white rounded text-xs font-medium hover:opacity-90" style={{ backgroundColor: 'var(--orchid-deep)' }}>
                <Mic size={14} />녹음
              </button>
              {!speechSupported && <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--orchid-accent)' }}><AlertCircle size={10} />Chrome 권장</span>}
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <button onClick={isPlaying ? pauseRecording : playRecording} className="p-1.5 text-white rounded hover:opacity-90" style={{ backgroundColor: 'var(--orchid-accent)' }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] mb-0.5" style={{ color: 'var(--text-light)' }}>
                <span>{formatTime(playbackTime)}</span><span>{formatTime(recording.duration)}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--orchid)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${recording.duration > 0 ? (playbackTime / recording.duration) * 100 : 0}%`, backgroundColor: 'var(--orchid-accent)' }} />
              </div>
            </div>
            <button onClick={downloadRecording} className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--orchid-dark)' }}><Download size={14} /></button>
            <button onClick={deleteRecording} className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--text-light)' }}><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      {recording && (
        <div className="text-[10px] px-2.5 py-1.5 rounded" style={{ backgroundColor: 'var(--cloud)', border: '1px solid var(--orchid)' }}>
          {recording.transcript ? (
            <span style={{ color: 'var(--text-mid)' }}><span className="font-medium" style={{ color: 'var(--text-dark)' }}>인식: </span>{recording.transcript.slice(0, 80)}{recording.transcript.length > 80 ? '...' : ''}</span>
          ) : (
            <span className="flex items-center gap-1" style={{ color: 'var(--orchid-accent)' }}><AlertCircle size={10} />음성 인식 결과 없음</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
