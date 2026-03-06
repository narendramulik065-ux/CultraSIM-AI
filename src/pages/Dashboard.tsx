import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, FileText, LogOut, Activity, TrendingUp, Award, Globe, ChevronRight, X, User, Briefcase, Settings, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const performanceData = [
  { name: "Mon", confidence: 65, cultural: 70, politeness: 80 },
  { name: "Tue", confidence: 72, cultural: 75, politeness: 82 },
  { name: "Wed", confidence: 68, cultural: 78, politeness: 85 },
  { name: "Thu", confidence: 85, cultural: 82, politeness: 88 },
  { name: "Fri", confidence: 82, cultural: 85, politeness: 90 },
  { name: "Sat", confidence: 90, cultural: 88, politeness: 92 },
  { name: "Sun", confidence: 94, cultural: 92, politeness: 95 },
];

const radarData = [
  { subject: 'Fluency', A: 85, fullMark: 100 },
  { subject: 'Grammar', A: 70, fullMark: 100 },
  { subject: 'Pronunciation', A: 90, fullMark: 100 },
  { subject: 'Confidence', A: 82, fullMark: 100 },
  { subject: 'Etiquette', A: 95, fullMark: 100 },
  { subject: 'Vocabulary', A: 75, fullMark: 100 },
];

const avatars = [
  { id: "kenji", name: "Kenji Sato", role: "Executive", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" },
  { id: "sarah", name: "Sarah Chen", role: "HR Director", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
  { id: "marcus", name: "Marcus Johnson", role: "Client", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200" }
];

const scenarios = [
  { id: "interview", title: "Job Interview", desc: "Formal interview for a senior position." },
  { id: "negotiation", title: "Contract Negotiation", desc: "High-stakes vendor agreement." },
  { id: "casual", title: "Networking Event", desc: "Casual business introduction." }
];

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("kenji");
  const [selectedScenario, setSelectedScenario] = useState("interview");
  const [difficulty, setDifficulty] = useState("intermediate");
  const navigate = useNavigate();
  
  // Mock user for preview purposes if not logged in
  const user = JSON.parse(localStorage.getItem("user") || '{"id": 1, "email": "user@example.com"}');

  useEffect(() => {
    fetch(`/api/sessions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch(() => {
        // Fallback mock data if API fails
        setSessions([
          { id: 1, createdAt: new Date().toISOString(), report: true, avgCulturalScore: 92 },
          { id: 2, createdAt: new Date(Date.now() - 86400000).toISOString(), report: true, avgCulturalScore: 85 },
        ]);
      });
  }, [user.id]);

  const startSimulation = async () => {
    // In a real app, we would pass the selected avatar, scenario, and difficulty to the backend
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, avatar: selectedAvatar, scenario: selectedScenario, difficulty }),
      });
      const data = await res.json();
      navigate(`/simulation/${data.id}`, { state: { avatar: selectedAvatar, scenario: selectedScenario } });
    } catch (e) {
      // Fallback for preview
      navigate(`/simulation/new-${Date.now()}`, { state: { avatar: selectedAvatar, scenario: selectedScenario } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--color-navy-900)] text-white p-6 md:p-10 relative">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-electric-blue)] opacity-10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-violet-glow)] opacity-10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-violet-glow)] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Command Center</h1>
              <p className="text-sm text-slate-400 font-mono">GlobalSpeak AI Engine v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-slate-300 font-mono">System Online</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Disconnect</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Metrics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-electric-blue)] opacity-5 blur-[50px] group-hover:opacity-20 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <Activity className="w-6 h-6 text-[var(--color-electric-blue)]" />
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">+12% this week</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Sessions</h3>
            <div className="text-4xl font-display font-bold text-white">24</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-violet-glow)] opacity-5 blur-[50px] group-hover:opacity-20 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <Award className="w-6 h-6 text-[var(--color-violet-glow)]" />
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">+5 pts</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Avg Comm Score</h3>
            <div className="text-4xl font-display font-bold text-white">88<span className="text-lg text-slate-500">/100</span></div>
          </motion.div>

          {/* Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-6 border border-[var(--color-electric-blue)]/30 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-electric-blue)]/10 to-transparent pointer-events-none" />
            <div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Initialize Training</h3>
              <p className="text-sm text-slate-400 mb-6">Configure and enter the simulation chamber.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full relative group overflow-hidden rounded-xl bg-white text-[var(--color-navy-900)] font-semibold py-3 px-4 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-electric-blue)] to-[var(--color-violet-glow)] opacity-0 group-hover:opacity-20 transition-opacity" />
              <Play className="w-5 h-5 fill-current" />
              <span>Setup Scenario</span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-electric-blue)]" />
                Score Trends
              </h2>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300 outline-none focus:border-[var(--color-electric-blue)]">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-electric-blue)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-electric-blue)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCultural" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-violet-glow)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-violet-glow)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPoliteness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-neon-pink)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-neon-pink)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-navy-800)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-electric-blue)' }}
                  />
                  <Area type="monotone" dataKey="confidence" stroke="var(--color-electric-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorConfidence)" name="Confidence" />
                  <Area type="monotone" dataKey="cultural" stroke="var(--color-violet-glow)" strokeWidth={2} fillOpacity={1} fill="url(#colorCultural)" name="Cultural" />
                  <Area type="monotone" dataKey="politeness" stroke="var(--color-neon-pink)" strokeWidth={2} fillOpacity={1} fill="url(#colorPoliteness)" name="Politeness" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col"
          >
            <h2 className="text-lg font-display font-semibold mb-2">Skill Radar</h2>
            <p className="text-xs text-slate-400 mb-4">Multidimensional communication analysis</p>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="var(--color-violet-glow)" strokeWidth={2} fill="var(--color-violet-glow)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Sessions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-6 glass-panel rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold">Recent Transmissions</h2>
            <button className="text-sm text-[var(--color-electric-blue)] hover:text-white transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-mono text-sm">No transmission logs found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div
                  key={session.id || idx}
                  className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[var(--color-electric-blue)]/30 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate(`/report/${session.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-navy-800)] border border-white/10 flex items-center justify-center group-hover:border-[var(--color-electric-blue)]/50 transition-colors">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-[var(--color-electric-blue)]" />
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                         {session.scenario ? `${session.scenario.charAt(0).toUpperCase() + session.scenario.slice(1)} with ${session.avatar}` : `Simulation #${session.id || idx + 1}`}
                        {session.report && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        {new Date(session.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Score</div>
                      <div className="font-mono font-bold text-[var(--color-electric-blue)]">{session.avgCulturalScore || 85}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Scenario Generator Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-2xl rounded-3xl border border-[var(--color-electric-blue)]/30 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-electric-blue)]/20 flex items-center justify-center border border-[var(--color-electric-blue)]/30">
                    <Settings className="w-5 h-5 text-[var(--color-electric-blue)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">Scenario Generator</h2>
                    <p className="text-xs text-[var(--color-electric-blue)] font-mono uppercase tracking-widest">Configure Parameters</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* Avatar Selection */}
                <div>
                  <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--color-violet-glow)]" />
                    Select AI Avatar
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {avatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedAvatar === avatar.id ? "border-[var(--color-electric-blue)] shadow-[0_0_15px_rgba(0,229,255,0.3)]" : "border-transparent hover:border-white/20"
                        }`}
                      >
                        <img src={avatar.image} alt={avatar.name} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                          <span className="text-sm font-bold text-white">{avatar.name}</span>
                          <span className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">{avatar.role}</span>
                        </div>
                        {selectedAvatar === avatar.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-electric-blue)] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-[var(--color-navy-900)]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scenario Selection */}
                <div>
                  <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[var(--color-neon-pink)]" />
                    Select Scenario
                  </h3>
                  <div className="space-y-3">
                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        onClick={() => setSelectedScenario(scenario.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedScenario === scenario.id 
                            ? "bg-[var(--color-electric-blue)]/10 border-[var(--color-electric-blue)]/50" 
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-white mb-1">{scenario.title}</div>
                          <div className="text-xs text-slate-400">{scenario.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedScenario === scenario.id ? "border-[var(--color-electric-blue)]" : "border-slate-500"
                        }`}>
                          {selectedScenario === scenario.id && <div className="w-2 h-2 rounded-full bg-[var(--color-electric-blue)]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Difficulty Level
                  </h3>
                  <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-colors ${
                          difficulty === level ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20 shrink-0 flex justify-end gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startSimulation}
                  className="px-8 py-2 rounded-xl bg-white text-[var(--color-navy-900)] font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Initialize
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
