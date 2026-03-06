import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Activity, Globe, ArrowRight, Play } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-navy-900)] text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-electric-blue)] opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[var(--color-violet-glow)] opacity-20 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-violet-glow)] flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">GlobalSpeak AI</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</button>
          <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Methodology</button>
          <button 
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium px-5 py-2 rounded-full glass-panel hover:bg-white/10 transition-all border border-white/10"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--color-electric-blue)]/30 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--color-electric-blue)] animate-pulse" />
          <span className="text-xs font-mono text-[var(--color-electric-blue)] tracking-wider uppercase">GlobalSpeak AI 2.0 is live</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-6 leading-tight"
        >
          Train Your <br />
          <span className="gradient-text">Communication Skills</span> <br />
          With AI
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 font-light"
        >
          Practice meetings, interviews, and negotiations with intelligent AI executives. Get real-time feedback on fluency, cultural etiquette, and confidence.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button 
            onClick={() => navigate("/dashboard")}
            className="group relative px-8 py-4 bg-white text-[var(--color-navy-900)] rounded-full font-semibold text-lg overflow-hidden transition-transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-electric-blue)] to-[var(--color-violet-glow)] opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="flex items-center gap-2">
              Start Training <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button className="px-8 py-4 rounded-full glass-panel font-medium text-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Play className="w-5 h-5 text-[var(--color-electric-blue)]" /> Watch Demo
          </button>
        </motion.div>

        {/* Floating UI Elements Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-24 relative w-full max-w-5xl aspect-video rounded-2xl glass-panel border border-white/10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-navy-900)]/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=2069" 
            alt="AI Simulation Preview" 
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay UI Elements */}
          <div className="absolute top-8 left-8 z-20 glass-panel p-4 rounded-xl animate-float" style={{ animationDelay: "0s" }}>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-4 h-4 text-[var(--color-neon-pink)]" />
              <span className="text-xs font-mono text-slate-300 uppercase">Live Analysis</span>
            </div>
            <div className="text-2xl font-display font-bold text-white">94<span className="text-sm text-slate-400">/100</span></div>
            <div className="text-xs text-emerald-400 mt-1">Cultural Alignment Excellent</div>
          </div>

          <div className="absolute bottom-8 right-8 z-20 glass-panel p-4 rounded-xl animate-float" style={{ animationDelay: "1s" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-electric-blue)]/20 flex items-center justify-center animate-pulse-glow">
                <Mic className="w-5 h-5 text-[var(--color-electric-blue)]" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Listening...</div>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-1 h-3 bg-[var(--color-electric-blue)] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
