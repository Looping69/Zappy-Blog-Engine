
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  BlogState, 
  AgentId, 
  AGENTS, 
  AgentResponse 
} from './types';
import { geminiService } from './services/geminiService';
import AgentCard from './components/AgentCard';
import MarkdownRenderer from './components/MarkdownRenderer';

const App: React.FC = () => {
  const [state, setState] = useState<BlogState>({
    keyword: '',
    activeAgents: [],
    history: [],
    finalPost: null,
    isGenerating: false,
    error: null
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.history, state.activeAgents]);

  const runOrchestrator = async (keyword: string) => {
    if (!keyword.trim()) return;

    setState(prev => ({ 
      ...prev, 
      keyword, 
      isGenerating: true, 
      error: null, 
      history: [], 
      finalPost: null,
      activeAgents: []
    }));

    let currentContext = "";
    
    try {
      setState(prev => ({ ...prev, activeAgents: [AgentId.RESEARCHER] }));
      const researchResult = await geminiService.runAgentTask(AgentId.RESEARCHER, keyword, "");
      const researchResponse: AgentResponse = { agentId: AgentId.RESEARCHER, content: researchResult, timestamp: Date.now() };
      currentContext += `\n\n[RESEARCH REPORT]\n${researchResult}`;
      setState(prev => ({ ...prev, history: [researchResponse] }));

      setState(prev => ({ ...prev, activeAgents: [AgentId.WRITER] }));
      const draftResult = await geminiService.runAgentTask(AgentId.WRITER, keyword, currentContext);
      const draftResponse: AgentResponse = { agentId: AgentId.WRITER, content: draftResult, timestamp: Date.now() };
      currentContext += `\n\n[INITIAL DRAFT]\n${draftResult}`;
      setState(prev => ({ ...prev, history: [researchResponse, draftResponse] }));

      setState(prev => ({ ...prev, activeAgents: [AgentId.COMPLIANCE, AgentId.ENHANCER, AgentId.SEO] }));
      const parallelTask = async (id: AgentId) => {
        const result = await geminiService.runAgentTask(id, keyword, currentContext);
        return { agentId: id, content: result, timestamp: Date.now() };
      };
      const parallelResults = await Promise.all([
        parallelTask(AgentId.COMPLIANCE),
        parallelTask(AgentId.ENHANCER),
        parallelTask(AgentId.SEO)
      ]);

      const updatedHistory = [researchResponse, draftResponse, ...parallelResults];
      setState(prev => ({ ...prev, history: updatedHistory }));
      parallelResults.forEach(res => {
        const agentName = AGENTS.find(a => a.id === res.agentId)?.name || res.agentId;
        currentContext += `\n\n[FEEDBACK FROM ${agentName.toUpperCase()}]\n${res.content}`;
      });

      setState(prev => ({ ...prev, activeAgents: [AgentId.EDITOR] }));
      const finalResult = await geminiService.runAgentTask(AgentId.EDITOR, keyword, currentContext);
      const finalResponse: AgentResponse = { agentId: AgentId.EDITOR, content: finalResult, timestamp: Date.now() };
      setState(prev => ({ ...prev, history: [...updatedHistory, finalResponse], finalPost: finalResult }));

    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message || "System failure." }));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false, activeAgents: [] }));
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const keyword = formData.get('keyword') as string;
    runOrchestrator(keyword);
  };

  const reset = () => {
    setState({ keyword: '', activeAgents: [], history: [], finalPost: null, isGenerating: false, error: null });
  };

  return (
    <div className="flex h-screen w-full bg-[#FDFCFB] overflow-hidden">
      {/* Sidebar Dashboard */}
      <aside className="w-80 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-4 flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100 transition-transform group-hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-none">Zappy</h1>
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Blog Engine</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Neural Pipeline</h3>
            <div className="space-y-1">
              {AGENTS.map(agent => (
                <AgentCard 
                  key={agent.id}
                  agent={agent}
                  isActive={state.activeAgents.includes(agent.id)}
                  isCompleted={state.history.some(h => h.agentId === agent.id)}
                  isWaiting={!state.activeAgents.includes(agent.id) && !state.history.some(h => h.agentId === agent.id)}
                />
              ))}
            </div>
          </div>

          {(state.isGenerating || state.finalPost) && (
            <div className="px-4 py-6 rounded-3xl bg-orange-50/50 border border-orange-100">
               <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-3">Generation Stats</h3>
               <div className="space-y-3">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-500">Progress</span>
                   <span className="font-bold text-orange-600">{Math.round((state.history.length / AGENTS.length) * 100)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${(state.history.length / AGENTS.length) * 100}%` }}></div>
                 </div>
               </div>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
             <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs">⚡</div>
             <div className="flex-1">
               <p className="text-[10px] font-bold text-slate-900">High-Speed Engine</p>
               <p className="text-[9px] text-slate-400 font-medium">Parallel Consensus v2.4</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-12">
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-slate-400">Project /</span>
             <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
               {state.keyword || 'Medical Content Hub'}
             </span>
          </div>
          <div className="flex items-center gap-6">
             <button onClick={reset} className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors">History</button>
             <button onClick={reset} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-slate-200">New Post</button>
          </div>
        </header>

        <div className="flex-1 p-12 max-w-5xl mx-auto w-full">
          {!state.isGenerating && !state.finalPost ? (
            <div className="mt-20 text-center animate-[fadeIn_0.5s_ease-out]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                 6 Specialized Medical Agents
              </div>
              <h2 className="text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">
                Generate expert blogs with <br/>
                <span className="text-orange-500 italic">Zappy precision.</span>
              </h2>
              <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Enter your medical topic and watch our neural pipeline collaborate across research, accuracy, and optimization in real-time.
              </p>
              
              <form onSubmit={handleStart} className="max-w-2xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white border-2 border-slate-100 rounded-2xl flex items-center p-2 shadow-xl">
                  <input 
                    type="text" 
                    name="keyword"
                    placeholder="e.g. Cognitive effects of intermittent fasting..." 
                    required
                    className="flex-1 pl-6 pr-4 py-4 outline-none text-lg font-medium placeholder:text-slate-300"
                  />
                  <button 
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg shadow-orange-200 uppercase tracking-wider text-xs active:scale-95"
                  >
                    Launch
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="pb-32">
              {state.isGenerating && !state.finalPost ? (
                <div className="space-y-8">
                  <div className="bg-orange-500 p-12 rounded-[40px] text-white shadow-2xl shadow-orange-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 scale-150">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black mb-2">Processing: {state.keyword}</h2>
                      <p className="text-orange-100 text-sm font-bold uppercase tracking-widest">Parallel Neural Synthesis in Progress</p>
                      <div className="mt-8 flex gap-2">
                        {Array.from({length: 6}).map((_, i) => (
                          <div key={i} className={`h-1.5 w-full rounded-full ${i < state.history.length ? 'bg-white' : 'bg-white/20 animate-pulse'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {state.history.map((item, idx) => {
                    const agent = AGENTS.find(a => a.id === item.agentId);
                    return (
                      <div key={idx} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-[slideIn_0.4s_ease-out] group hover:border-orange-200 transition-colors">
                        <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{agent?.icon}</span>
                            <div>
                              <span className="font-black text-slate-900 block text-[10px] uppercase tracking-widest">{agent?.name}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">{agent?.role}</span>
                            </div>
                          </div>
                          <div className="h-6 w-px bg-slate-200"></div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Neural_Log v{idx+1}.0</span>
                        </div>
                        <div className="p-8">
                          <div className="text-slate-600 whitespace-pre-wrap text-sm max-h-[300px] overflow-y-auto font-mono bg-slate-50 p-6 rounded-2xl border border-slate-100 custom-scrollbar leading-relaxed">
                            {item.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              ) : state.finalPost && (
                <div className="bg-white p-12 md:p-20 rounded-[52px] shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-slate-100 animate-[fadeIn_0.8s_ease-out] relative">
                  <div className="mb-12">
                     <div className="inline-flex items-center gap-3 px-6 py-2 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-orange-100">
                       <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-sm"></span>
                       Clinical Grade Publication
                     </div>
                  </div>

                  <MarkdownRenderer content={state.finalPost} />
                  
                  <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row gap-10 items-center justify-between no-print">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">🎖️</div>
                        <div>
                          <p className="text-base font-black text-slate-900 leading-tight">Zappy Authority Suite</p>
                          <p className="text-xs text-slate-400 font-medium">Verified by 6 Medical Agents • {new Date().toLocaleDateString()}</p>
                        </div>
                     </div>
                     <button 
                       onClick={reset}
                       className="bg-slate-900 hover:bg-orange-500 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest text-xs"
                     >
                       New Content Mission
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;
