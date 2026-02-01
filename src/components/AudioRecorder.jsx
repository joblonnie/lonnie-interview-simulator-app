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

  // Web Speech API 지원 확인
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
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

      // Web Speech API 초기화
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interim = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          if (finalTranscript) {
            transcriptRef.current += finalTranscript;
          }
          setInterimText(interim);
        };

        recognition.onerror = (event) => {
          console.log('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
          // 녹음 중인데 인식이 끝나면 다시 시작 (네트워크 끊김 등)
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              recognition.start();
            } catch (e) {
              console.log('Recognition restart failed:', e);
            }
          }
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          console.log('Speech recognition start failed:', e);
        }
      }

      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // 음성 인식 중지
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log('Recognition stop failed:', e);
          }
        }

        const finalTranscript = transcriptRef.current.trim();

        setRecordings(prev => ({
          ...prev,
          [questionId]: {
            url: audioUrl,
            duration: recordingTimeRef.current,
            blob: audioBlob,
            transcript: finalTranscript || null
          }
        }));
        stream.getTracks().forEach(track => track.stop());
        setInterimText('');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch {
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition stop failed:', e);
        }
      }
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

  const downloadRecording = () => {
    if (recording && recording.blob) {
      const url = URL.createObjectURL(recording.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${questionId.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.webm`;
      a.click();
      URL.revokeObjectURL(url);
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Volume2 size={16} className="text-gray-400" />
        {!recording ? (
          isRecording ? (
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-600 font-medium">녹음 중... {formatTime(recordingTime)}</span>
                {speechSupported && <span className="text-xs text-blue-500">🎤 음성 인식 중</span>}
                <button onClick={stopRecording} className="ml-auto p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Square size={16} /></button>
              </div>
              {/* 실시간 인식 텍스트 표시 */}
              {(transcriptRef.current || interimText) && (
                <div className="text-xs text-gray-600 bg-white rounded p-2 border border-gray-200">
                  {transcriptRef.current}
                  <span className="text-gray-400">{interimText}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <button onClick={startRecording} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-600">
                <Mic size={16} />내 답변 녹음하기
              </button>
              {!speechSupported && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle size={12} />Chrome 브라우저에서 음성 인식 지원
                </span>
              )}
            </div>
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
            <button onClick={downloadRecording} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="녹음 다운로드"><Download size={16} /></button>
            <button onClick={deleteRecording} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="녹음 삭제"><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      {/* 인식된 텍스트 또는 인식 실패 안내 */}
      {recording && (
        <div className="text-xs px-3 py-2 bg-gray-50 rounded-lg">
          {recording.transcript ? (
            <span className="text-gray-600">
              <span className="font-medium text-gray-700">인식된 내용: </span>
              {recording.transcript.slice(0, 100)}{recording.transcript.length > 100 ? '...' : ''}
            </span>
          ) : (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertCircle size={12} />
              음성 인식 결과가 없습니다. Chrome 브라우저를 사용하고 마이크 권한을 확인하세요.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
