import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import {
  Mic,
  MicOff,
  Square,
  Activity,
  Volume2,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Define types for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AVATARS = {
  kenji: { name: "Kenji Sato", role: "Executive", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" },
  sarah: { name: "Sarah Chen", role: "HR Director", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" },
  marcus: { name: "Marcus Johnson", role: "Client", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800" }
};

export default function Simulation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { avatar = "kenji", scenario = "interview" } = location.state || {};
  
  const currentAvatar = AVATARS[avatar as keyof typeof AVATARS] || AVATARS.kenji;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<
    { role: string; content: string }[]
  >([]);
  const [scores, setScores] = useState({
    cultural: 0,
    confidence: 0,
    politeness: 0,
    speech_pace: 0,
  });
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [textInput, setTextInput] = useState("");

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = async (event: any) => {
        const currentTranscript = event.results[0][0].transcript;
        handleUserSpeech(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          setErrorMsg(
            "Microphone access denied. Please allow microphone access.",
          );
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setErrorMsg(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      );
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      endSimulation();
    }
  }, [timeLeft]);

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setErrorMsg("");
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        startTimer();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUserSpeech = async (text: string) => {
    setIsProcessing(true);
    const newTranscript = [...transcript, { role: "user", content: text }];
    setTranscript(newTranscript);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are ${currentAvatar.name}, a ${currentAvatar.role}.
The user is practicing a ${scenario} scenario with you.
Follow these rules:
- Japanese culture is high-context.
- Direct disagreement is discouraged.
- Politeness and humility are valued.
- Hierarchy must be respected.
- Avoid strong self-promotion.
- Evaluate the user's tone, politeness, speech pace, and cultural alignment based on their latest input.
- Respond naturally to their input as the ${currentAvatar.role}.
- Return structured JSON with scores.`;

      let contents = transcript.slice(-5).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));
      contents.push({ role: "user", parts: [{ text }] });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "Your natural response in English (or Japanese if appropriate) as the executive." },
              cultural_score: { type: Type.NUMBER, description: "Score from 0 to 100" },
              confidence_score: { type: Type.NUMBER, description: "Score from 0 to 100" },
              politeness_score: { type: Type.NUMBER, description: "Score from 0 to 100" },
              speech_pace: { type: Type.NUMBER, description: "Score from 0 to 100 representing appropriate pace" },
              feedback_note: { type: Type.STRING, description: "Brief feedback on the user's input" }
            },
            required: ["reply", "cultural_score", "confidence_score", "politeness_score", "speech_pace", "feedback_note"]
          }
        }
      });

      const resultText = response.text || "{}";
      const data = JSON.parse(resultText);

      setScores({
        cultural: data.cultural_score || 0,
        confidence: data.confidence_score || 0,
        politeness: data.politeness_score || 0,
        speech_pace: data.speech_pace || 0,
      });

      setTranscript([...newTranscript, { role: "model", content: data.reply }]);

      try {
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: data.reply }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" }
              }
            }
          }
        });
        const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioBase64) {
          playAudio(audioBase64);
        } else {
          fallbackTTS(data.reply);
        }
      } catch (ttsErr: any) {
        const errStr = typeof ttsErr === 'object' ? JSON.stringify(ttsErr) : String(ttsErr);
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
          console.warn("TTS rate limit exceeded. Using browser fallback.");
          setErrorMsg("TTS rate limit exceeded. Using browser fallback.");
        } else {
          console.error("TTS Error:", ttsErr);
        }
        fallbackTTS(data.reply);
      }
    } catch (err: any) {
      const errStr = typeof err === 'object' ? JSON.stringify(err) : String(err);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
        console.warn("API rate limit exceeded.");
        setErrorMsg("API rate limit exceeded. Please try again in a minute.");
      } else {
        console.error(err);
        setErrorMsg(err.message || "Failed to process speech");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  const fallbackTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playAudio = (base64Audio: string) => {
    try {
      // Decode base64 to Uint8Array
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create WAV Blob (16-bit PCM, 24000 Hz, 1 channel)
      const sampleRate = 24000;
      const numChannels = 1;
      const byteRate = sampleRate * numChannels * 2;
      const blockAlign = numChannels * 2;
      const buffer = new ArrayBuffer(44 + bytes.length);
      const view = new DataView(buffer);

      const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + bytes.length, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, bytes.length, true);
      new Uint8Array(buffer, 44).set(bytes);

      const blob = new Blob([buffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audioRef.current = audio;
      }

      audio.src = audioUrl;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);

      audio.play().catch((e) => {
        console.error("Audio play failed", e);
        setIsSpeaking(false);
      });
    } catch (e) {
      console.error("Failed to process audio data", e);
      setIsSpeaking(false);
    }
  };

  const endSimulation = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `Analyze this business meeting conversation and generate structured feedback.
The user was practicing a ${scenario} scenario with ${currentAvatar.name} (${currentAvatar.role}).
Identify top 3 cultural mistakes, top 3 strengths, and improvement suggestions.
Also provide an evaluation of grammar, fluency, pronunciation, and emotion.
Return structured JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: JSON.stringify(transcript),
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              health_score: { type: Type.NUMBER, description: "Overall Communication Health Score (0-100)" },
              grammar_score: { type: Type.NUMBER, description: "Grammar Score (0-100)" },
              fluency_score: { type: Type.NUMBER, description: "Fluency Score (0-100)" },
              pronunciation_score: { type: Type.NUMBER, description: "Pronunciation Score (0-100)" },
              emotion_detected: { type: Type.STRING, description: "Primary emotion detected in user" },
              emotion_timeline: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: {
                    time: { type: Type.STRING, description: "Time like '0:00'" },
                    confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
                    nervousness: { type: Type.NUMBER, description: "Nervousness score 0-100" }
                  },
                  required: ["time", "confidence", "nervousness"]
                }
              },
              grammar_corrections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific grammar corrections" }
            },
            required: ["mistakes", "strengths", "suggestions", "health_score", "grammar_score", "fluency_score", "pronunciation_score", "emotion_detected", "emotion_timeline", "grammar_corrections"]
          }
        }
      });

      const resultText = response.text || "{}";
      const reportData = JSON.parse(resultText);

      // Save Session
      await fetch(`/api/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          avgCulturalScore: scores.cultural,
          avgConfidenceScore: scores.confidence,
          avgPolitenessScore: scores.politeness,
          report: reportData,
          avatar: currentAvatar.name,
          scenario: scenario,
        }),
      });

      navigate(`/report/${id}`);
    } catch (err: any) {
      const errStr = typeof err === 'object' ? JSON.stringify(err) : String(err);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
        console.warn("API rate limit exceeded during report generation.");
        setErrorMsg("API rate limit exceeded. Could not generate report. Please try again later.");
      } else {
        console.error(err);
        setErrorMsg("Failed to generate report");
      }
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleTextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const text = textInput;
    setTextInput("");
    handleUserSpeech(text);
  };

  return (
    <div className="min-h-screen bg-[var(--color-navy-900)] text-white p-4 md:p-6 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-violet-glow)] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">Simulation Chamber</h1>
            <p className="text-xs text-[var(--color-electric-blue)] font-mono tracking-widest uppercase">Active Session</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={endSimulation}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-lg font-medium hover:bg-rose-500/30 transition-colors disabled:opacity-50"
          >
            <Square className="w-4 h-4" />
            End Session
          </button>
        </div>
      </header>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-4 shrink-0">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 glass-panel rounded-2xl border border-white/10 overflow-hidden relative flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-white">{currentAvatar.name} - {currentAvatar.role}</span>
            </div>
            <div className="flex-1 relative">
              <img 
                src={currentAvatar.image} 
                alt={currentAvatar.name} 
                className={`w-full h-full object-cover transition-all duration-300 ${isSpeaking ? 'scale-105 brightness-110 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]' : 'scale-100'}`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy-900)] via-transparent to-transparent" />
              
              {/* Audio Waveform Overlay (Mock) */}
              {isSpeaking && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-[var(--color-electric-blue)] rounded-full animate-waveform" 
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.5s'
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Transcript & Input */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <div className="flex-1 glass-panel rounded-2xl border border-white/10 p-6 overflow-y-auto flex flex-col gap-4 scroll-smooth">
            {transcript.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <Volume2 className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-mono text-sm">Awaiting voice input...</p>
              </div>
            ) : (
              transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-[var(--color-electric-blue)]/20 to-[var(--color-violet-glow)]/20 border border-[var(--color-electric-blue)]/30 text-white rounded-br-sm"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm"
                    }`}
                  >
                    <div className="text-[10px] opacity-50 mb-1 uppercase tracking-widest font-mono">
                      {msg.role === "user" ? "You" : currentAvatar.name}
                    </div>
                    <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 text-slate-300 p-4 rounded-2xl rounded-bl-sm flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-electric-blue)]" />
                  <span className="text-sm font-mono">Processing response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="glass-panel rounded-2xl border border-white/10 p-4 shrink-0">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <button
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all ${
                    isRecording
                      ? "bg-rose-500 hover:bg-rose-600 animate-pulse"
                      : "bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-violet-glow)] hover:opacity-90"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Click to speak"
                >
                  {isRecording ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                  {isRecording && (
                    <span className="absolute -inset-2 rounded-full border border-rose-500 opacity-50 animate-ping"></span>
                  )}
                </button>
              </div>
              
              <div className="relative flex items-center gap-4 w-full">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Manual Override</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <form onSubmit={handleTextInputSubmit} className="flex gap-2 w-full">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your response..."
                  disabled={isProcessing || isRecording}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-electric-blue)] disabled:opacity-50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing || isRecording}
                  className="bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Live Metrics */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-6 overflow-y-auto min-h-0">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 shrink-0">
            <Activity className="w-5 h-5 text-[var(--color-neon-pink)]" />
            <h2 className="text-sm font-display font-semibold uppercase tracking-wider">Live Intelligence</h2>
          </div>

          <div className="space-y-6 flex-1">
            <MetricCircular 
              label="Cultural Alignment" 
              score={scores.cultural} 
              color="var(--color-electric-blue)" 
            />
            <MetricBar
              label="Confidence Level"
              score={scores.confidence}
              color="bg-[var(--color-violet-glow)]"
            />
            <MetricBar
              label="Politeness Index"
              score={scores.politeness}
              color="bg-[var(--color-neon-pink)]"
            />
            <MetricBar
              label="Speech Pace"
              score={scores.speech_pace}
              color="bg-emerald-400"
            />
          </div>

          <div className="mt-auto bg-black/20 p-4 rounded-xl border border-white/5 shrink-0">
            <h3 className="text-[10px] font-mono text-slate-500 mb-3 uppercase tracking-widest">
              Protocol Guidelines
            </h3>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-electric-blue)]">›</span> Avoid direct disagreement.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-electric-blue)]">›</span> Use formal language.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-electric-blue)]">›</span> Show humility and respect.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold font-mono text-white">{score}<span className="text-slate-500">/100</span></span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out relative`}
          style={{ width: `${score}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function MetricCircular({ label, score, color }: { label: string, score: number, color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-xl border border-white/5">
      <div className="relative w-24 h-24 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-300 uppercase tracking-wider text-center">{label}</span>
    </div>
  );
}
