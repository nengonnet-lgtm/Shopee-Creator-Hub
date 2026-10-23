
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, AlertCircle, RefreshCcw, Upload } from 'lucide-react';
import { blobToBase64 } from '../services/audioUtils';

interface AudioRecorderProps {
  onAudioCaptured: (base64: string | null) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioCaptured, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Explicitly request audio/webm to ensure consistent format for the API
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Create blob with explicit type
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); 
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Convert to base64 and pass to parent
        const base64 = await blobToBase64(blob);
        onAudioCaptured(base64);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตสิทธิ์");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setError(null);
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      const base64 = await blobToBase64(file);
      onAudioCaptured(base64);
    } catch (err) {
      console.error("Error processing file:", err);
      setError("ไม่สามารถอ่านไฟล์ได้");
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onAudioCaptured(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileName = () => {
      if (!audioBlob) return '';
      if ((audioBlob as File).name) return (audioBlob as File).name;
      return 'Recorded_Audio.webm';
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
           <Mic className="w-4 h-4 text-fuchsia-600" />
           ต้นฉบับเสียง (Reference Audio)
        </label>
        {audioBlob && (
           <button 
             onClick={resetRecording}
             disabled={disabled}
             className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
           >
             <RefreshCcw className="w-3 h-3" />
             เริ่มใหม่
           </button>
        )}
      </div>

      {error && (
        <div className="mb-3 bg-red-50 text-red-600 p-2 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
        </div>
      )}

      {!audioBlob ? (
        <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-lg border-dashed">
            {isRecording ? (
                <div className="text-center space-y-3">
                     <div className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                        <div className="relative bg-red-500 p-4 rounded-full text-white shadow-lg">
                            <Mic className="w-6 h-6" />
                        </div>
                     </div>
                     <div className="text-red-600 font-mono font-bold text-lg">{formatTime(recordingTime)}</div>
                     <button
                        onClick={stopRecording}
                        className="px-6 py-2 bg-slate-800 text-white text-sm rounded-full font-medium hover:bg-slate-900 transition-colors"
                     >
                        หยุดบันทึก
                     </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full px-4">
                    <div className="flex items-center justify-center gap-6 sm:gap-10 w-full">
                        {/* Record Option */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={startRecording}>
                             <button
                                disabled={disabled}
                                className="bg-fuchsia-50 group-hover:bg-fuchsia-100 p-4 rounded-full transition-all border border-fuchsia-100 shadow-sm"
                             >
                                <Mic className="w-6 h-6 text-fuchsia-600 group-hover:scale-110 transition-transform" />
                             </button>
                             <span className="text-xs text-slate-500 font-medium group-hover:text-fuchsia-600">อัดเสียง</span>
                        </div>
                        
                        <div className="w-px h-12 bg-slate-200"></div>

                        {/* Upload Option */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <button
                                disabled={disabled}
                                className="bg-blue-50 group-hover:bg-blue-100 p-4 rounded-full transition-all border border-blue-100 shadow-sm"
                             >
                                <Upload className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                             </button>
                             <span className="text-xs text-slate-500 font-medium group-hover:text-blue-600">อัปโหลดไฟล์</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center">
                        กดอัดเสียง 5-10 วินาที หรืออัปโหลดไฟล์ (WAV, MP3, M4A)
                    </p>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                className="hidden" 
            />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            <button
                onClick={togglePlayback}
                className="w-10 h-10 flex items-center justify-center bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-700 transition-colors flex-shrink-0"
            >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
            </button>
            <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-slate-700 truncate">{getFileName()}</div>
                <div className="text-xs text-slate-400">พร้อมใช้งานสำหรับการโคลน</div>
            </div>
            <audio 
                ref={audioPlayerRef} 
                src={audioUrl || ''} 
                onEnded={() => setIsPlaying(false)} 
                className="hidden" 
            />
        </div>
      )}
      
      <p className="text-[10px] text-slate-400 mt-2">
         * เพื่อผลลัพธ์ที่ดีที่สุด: ใช้ไฟล์เสียงที่มีเสียงพูดชัดเจน ไม่มีเสียงรบกวน (ความยาวไม่เกิน 1-2 นาที)
      </p>
    </div>
  );
};

export default AudioRecorder;
