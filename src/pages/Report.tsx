import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from "recharts";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Download,
  Activity,
  Award,
  TrendingUp,
  MessageSquare
} from "lucide-react";

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback for preview
        setSession({
          report: JSON.stringify({
            health_score: 88,
            grammar_score: 75,
            fluency_score: 82,
            pronunciation_score: 90,
            emotion_detected: "Confident",
            strengths: ["Clear pronunciation", "Good use of formal vocabulary", "Maintained professional tone"],
            mistakes: ["Interrupted the executive once", "Used casual form 'desu' instead of 'gozaimasu'", "Directly disagreed with a proposal"],
            suggestions: ["Wait for the executive to finish speaking", "Practice Keigo (honorifics)", "Use softer language when disagreeing"],
            grammar_corrections: ["'I go to there' -> 'I went there'", "'He don't know' -> 'He doesn't know'"]
          }),
          transcript: JSON.stringify([
            { role: "model", content: "Welcome. Let's discuss the quarterly results." },
            { role: "user", content: "Thank you for having me. The results are good." }
          ]),
          avgCulturalScore: 85,
          avgConfidenceScore: 92,
          avgPolitenessScore: 88
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-navy-900)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-electric-blue)]/20 border-t-[var(--color-electric-blue)] rounded-full animate-spin" />
          <div className="text-[var(--color-electric-blue)] font-mono text-sm tracking-widest uppercase animate-pulse">Analyzing Data...</div>
        </div>
      </div>
    );
  }

  if (!session || !session.report) {
    return (
      <div className="min-h-screen bg-[var(--color-navy-900)] flex items-center justify-center text-white">
        <div className="text-center glass-panel p-10 rounded-3xl border border-white/10">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Analysis Not Found</h2>
          <p className="text-slate-400 mb-8">The simulation data could not be retrieved or is incomplete.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  let report: any = {};
  let transcript: any[] = [];
  try {
    report = JSON.parse(session.report);
    transcript = JSON.parse(session.transcript);
  } catch (e) {
    console.error("Failed to parse report/transcript", e);
  }

  const barData = [
    { name: "Cultural", score: session.avgCulturalScore || 85 },
    { name: "Confidence", score: session.avgConfidenceScore || 92 },
    { name: "Politeness", score: session.avgPolitenessScore || 88 },
  ];

  const radarData = [
    { subject: 'Fluency', A: report.fluency_score || 85, fullMark: 100 },
    { subject: 'Grammar', A: report.grammar_score || 70, fullMark: 100 },
    { subject: 'Pronunciation', A: report.pronunciation_score || 90, fullMark: 100 },
    { subject: 'Confidence', A: session.avgConfidenceScore || 92, fullMark: 100 },
    { subject: 'Etiquette', A: session.avgCulturalScore || 85, fullMark: 100 },
    { subject: 'Vocabulary', A: 75, fullMark: 100 },
  ];

  const emotionData = report.emotion_timeline && report.emotion_timeline.length > 0 ? report.emotion_timeline : [
    { time: "0:00", confidence: 60, nervousness: 40 },
    { time: "1:00", confidence: 75, nervousness: 25 },
    { time: "2:00", confidence: 85, nervousness: 15 },
    { time: "3:00", confidence: 80, nervousness: 20 },
    { time: "4:00", confidence: 95, nervousness: 5 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-navy-900)] text-white p-6 md:p-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-[var(--color-electric-blue)] opacity-5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[20%] w-[50%] h-[50%] bg-[var(--color-violet-glow)] opacity-5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium font-mono text-sm uppercase tracking-wider">Command Center</span>
          </button>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[var(--color-electric-blue)]/10 border border-[var(--color-electric-blue)]/30 text-[var(--color-electric-blue)] font-medium py-2 px-4 rounded-xl hover:bg-[var(--color-electric-blue)]/20 transition-colors shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <Download className="w-4 h-4" />
              Export Analysis
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Health Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1 glass-panel rounded-3xl p-8 border border-[var(--color-electric-blue)]/30 relative overflow-hidden flex flex-col justify-center items-center text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-electric-blue)]/10 to-transparent pointer-events-none" />
            <Award className="w-10 h-10 text-[var(--color-electric-blue)] mb-4" />
            <h2 className="text-[var(--color-electric-blue)] font-mono text-sm uppercase tracking-widest mb-2">
              Overall Health Score
            </h2>
            <div className="text-7xl font-display font-bold text-white mb-4 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
              {report.health_score || 0}
            </div>
            {report.emotion_detected && (
              <div className="mt-2 mb-4 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">Primary Emotion: </span>
                <span className="text-xs font-bold text-[var(--color-violet-glow)] uppercase tracking-widest">{report.emotion_detected}</span>
              </div>
            )}
            <p className="text-slate-400 text-sm">
              Communication effectiveness in a high-context business environment.
            </p>
          </motion.div>

          {/* Radar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-1 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col"
          >
            <h3 className="text-lg font-display font-semibold mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--color-violet-glow)]" />
              Skill Matrix
            </h3>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="var(--color-violet-glow)" strokeWidth={2} fill="var(--color-violet-glow)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-1 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col"
          >
            <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--color-electric-blue)]" />
              Core Metrics
            </h3>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: 'var(--color-navy-800)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="score" fill="var(--color-electric-blue)" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Emotion Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel rounded-3xl p-6 border border-white/10 mb-6"
        >
          <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--color-neon-pink)]" />
            Emotion Timeline
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-electric-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-electric-blue)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNervousness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-neon-pink)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-neon-pink)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-navy-800)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="confidence" stroke="var(--color-electric-blue)" fillOpacity={1} fill="url(#colorConfidence)" />
                <Area type="monotone" dataKey="nervousness" stroke="var(--color-neon-pink)" fillOpacity={1} fill="url(#colorNervousness)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Feedback Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-display font-semibold text-white">Top Strengths</h3>
            </div>
            <ul className="space-y-4">
              {report.strengths?.map((item: string, i: number) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-emerald-400 mt-0.5">›</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-500/20 p-2 rounded-xl border border-rose-500/30">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-display font-semibold text-white">Cultural Mistakes</h3>
            </div>
            <ul className="space-y-4">
              {report.mistakes?.map((item: string, i: number) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-rose-400 mt-0.5">›</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-display font-semibold text-white">Suggestions</h3>
            </div>
            <ul className="space-y-4">
              {report.suggestions?.map((item: string, i: number) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-amber-400 mt-0.5">›</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-display font-semibold text-white">Grammar Corrections</h3>
            </div>
            <ul className="space-y-4">
              {report.grammar_corrections?.length > 0 ? report.grammar_corrections.map((item: string, i: number) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-blue-400 mt-0.5">›</span> {item}
                </li>
              )) : (
                <li className="text-slate-500 text-sm italic">No major grammar issues detected.</li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Transcript */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-panel p-8 rounded-3xl border border-white/10">
          <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--color-electric-blue)]" />
            Communication Log
          </h3>
          <div className="space-y-6">
            {transcript.map((msg: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-24 flex-shrink-0 text-right">
                  <span
                    className={`text-xs font-mono font-bold uppercase tracking-widest ${
                      msg.role === "user" ? "text-[var(--color-electric-blue)]" : "text-slate-500"
                    }`}
                  >
                    {msg.role === "user" ? "You" : "AI Avatar"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 leading-relaxed text-sm md:text-base">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
