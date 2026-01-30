
import React, { useState, useEffect, useRef } from 'react';
import { FASES_NEM, METODOLOGIAS, GRADOS_FLAT } from './constants.tsx';
import { Methodology, LessonPlan, PlanningRequest } from './types.ts';
import { generateLessonPlanStream } from './services/geminiService.ts';
import LessonPlanPreview from './components/LessonPlanPreview.tsx';
import { GraduationCap, Layout, Send, Loader2, AlertCircle, FilePlus, BookOpen, Terminal, Zap, RefreshCw, XCircle, Sparkles, Brain, Clock, Bookmark, Layers, Filter, Search, User, School, Hash, MapPin, Info, ListOrdered, Settings2, ShieldCheck, CheckCircle2, Building2, Map } from 'lucide-react';

const LOADING_STEPS = [
  "Analizando problemática del contexto...",
  "Extrayendo información del Programa Analítico...",
  "Realizando búsqueda exhaustiva de Contenidos...",
  "Vinculando Procesos de Desarrollo de Aprendizaje (PDA)...",
  "Articulando Ejes Articuladores y Campos Formativos...",
  "Diseñando secuencia didáctica situada...",
  "Generando sistema de evaluación formativa...",
  "Estructurando Plano Didáctico profesional..."
];

const App: React.FC = () => {
  const [nombreDocente, setNombreDocente] = useState<string>('');
  const [nombreEscuela, setNombreEscuela] = useState<string>('');
  const [cct, setCct] = useState<string>('');
  const [zonaEscolar, setZonaEscolar] = useState<string>('');
  const [grado, setGrado] = useState<string>('1° Secundaria');
  const [faseId, setFaseId] = useState<string>('Fase 6');
  const [metodologia, setMetodologia] = useState<Methodology>(METODOLOGIAS[0]);
  const [contexto, setContexto] = useState<string>('');
  const [numSesiones, setNumSesiones] = useState<number>(10);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGradoChange = (nuevoGrado: string) => {
    setGrado(nuevoGrado);
    const infoGrado = GRADOS_FLAT.find(g => g.grado === nuevoGrado);
    if (infoGrado) setFaseId(infoGrado.faseId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!nombreDocente.trim() || !nombreEscuela.trim()) {
      setError("Los datos del docente y la escuela son obligatorios.");
      return;
    }
    if (!contexto && !file) {
      setError("Define una problemática o vincula un Programa Analítico (PDF).");
      return;
    }

    setLoading(true);
    setError(null);
    setLessonPlan(null);

    try {
      const pdfBase64 = file ? await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      }) : undefined;

      const result = await generateLessonPlanStream(
        { nombreDocente, nombreEscuela, cct, zonaEscolar, fase: faseId, grado, metodologia, pdfBase64, pdfName: file?.name, contextoAdicional: contexto, numSesiones },
        () => {}
      );

      // Aseguramos que los datos del usuario se mantengan en el resultado final
      const finalPlan = {
        ...result,
        nombre_docente: nombreDocente,
        nombre_escuela: nombreEscuela,
        cct: cct,
        zona_escolar: zonaEscolar
      };

      setLessonPlan(finalPlan);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-3xl sticky top-0 z-[100] px-6 py-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-4 rounded-2xl border border-indigo-400/20 shadow-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">CODISEÑO NEM <span className="text-indigo-400">ULTRA</span></h1>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-1 block">Arquitectura Pedagógica de Grado Superior</span>
            </div>
          </div>
          {lessonPlan && (
            <button onClick={() => setLessonPlan(null)} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-slate-400 transition-all border border-white/5 group">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-[10px] font-black uppercase tracking-widest">Nueva Planeación</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-slate-800/50 border border-white/5 rounded-[3rem] p-10 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
              <Settings2 className="w-5 h-5 text-indigo-500" /> Parámetros del Proyecto
            </h2>
            
            <div className="space-y-6">
              {/* Sección Institucional */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Institución Educativa</label>
                  <div className="relative">
                    <School className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Nombre de la escuela..."
                      value={nombreEscuela}
                      onChange={(e) => setNombreEscuela(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/30 transition-all outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">C.C.T.</label>
                    <div className="relative">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="Clave..."
                        value={cct}
                        onChange={(e) => setCct(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/30 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Zona Escolar</label>
                    <div className="relative">
                      <Map className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="Número..."
                        value={zonaEscolar}
                        onChange={(e) => setZonaEscolar(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/30 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Nombre del Docente</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Nombre completo..."
                      value={nombreDocente}
                      onChange={(e) => setNombreDocente(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/30 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Parámetros de Grado y Metodología */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Grado Académico</label>
                  <select 
                    value={grado}
                    onChange={(e) => handleGradoChange(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold appearance-none cursor-pointer outline-none focus:ring-4 focus:ring-indigo-600/30"
                  >
                    {FASES_NEM.map(fase => (
                      <optgroup key={fase.id} label={fase.nombre}>
                        {fase.grados.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Metodología NEM</label>
                  <div className="relative">
                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <select 
                      value={metodologia}
                      onChange={(e) => setMetodologia(e.target.value as Methodology)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold appearance-none cursor-pointer outline-none focus:ring-4 focus:ring-indigo-600/30 text-indigo-100"
                    >
                      {METODOLOGIAS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Número de Sesiones</label>
                  <div className="relative">
                    <ListOrdered className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="number"
                      min={1}
                      max={40}
                      value={numSesiones}
                      onChange={(e) => setNumSesiones(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-xs font-bold focus:ring-4 focus:ring-indigo-600/30 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Programa Analítico (PDF)</label>
                  <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-input" />
                  <label htmlFor="pdf-input" className={`flex items-center gap-4 w-full p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'bg-indigo-600/10 border-indigo-600/50' : 'bg-slate-950/50 border-white/10 hover:border-indigo-600/40'}`}>
                    <FilePlus className={`w-6 h-6 ${file ? 'text-indigo-400' : 'text-slate-700'}`} />
                    <span className="text-[10px] font-black text-slate-300 truncate">{file ? file.name : 'Vincular PDF de referencia'}</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Problemática / Contexto</label>
                  <textarea 
                    rows={4} value={contexto} 
                    onChange={(e) => setContexto(e.target.value)} 
                    placeholder="Describe el reto comunitario o situación de aprendizaje..." 
                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-600/30 resize-none" 
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={loading} 
                className={`w-full py-6 rounded-2xl font-black text-[12px] text-white shadow-xl flex items-center justify-center gap-4 uppercase tracking-[0.3em] transition-all ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-600/40'}`}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white" />}
                {loading ? 'ANALIZANDO...' : 'DISEÑAR PROYECTO'}
              </button>

              {error && (
                <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-2xl flex gap-3 text-red-400 text-[10px] font-black">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8 min-h-[800px]">
          {loading ? (
            <div className="bg-slate-800/30 border border-white/5 rounded-[4rem] p-20 lg:p-32 h-full flex flex-col items-center justify-center backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                  <Brain className="w-12 h-12 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tighter">Sintetizando Conocimiento</h3>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-indigo-400 text-sm font-black uppercase tracking-widest animate-bounce">
                      {LOADING_STEPS[loadingStep]}
                    </p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Generando Planeación Profesional</p>
                  </div>
                </div>
                <div className="w-full max-w-xs bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full animate-progress" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          ) : lessonPlan ? (
            <div className="animate-in fade-in zoom-in-95 duration-1000">
              <LessonPlanPreview plan={lessonPlan} />
            </div>
          ) : (
            <div className="bg-slate-800/10 border-4 border-dashed border-white/5 rounded-[5rem] p-24 lg:p-40 flex flex-col items-center justify-center text-center h-full group">
              <BookOpen className="w-20 h-20 text-slate-700 mb-10 group-hover:scale-110 group-hover:text-indigo-600 transition-all duration-700" />
              <h3 className="text-4xl font-black text-white mb-6 tracking-tighter">Planeación Estratégica NEM</h3>
              <p className="text-slate-500 text-sm max-w-sm font-bold leading-relaxed mb-10 opacity-80">
                Selecciona tu metodología y carga tu Programa Analítico para generar una planeación profesional basada en el Plan de Estudio 2022.
              </p>
              <div className="flex gap-4">
                 <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-2 rounded-xl text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> IA Pedagógica
                 </div>
                 <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Plan 2022
                 </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .animate-progress {
          animation: progress 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default App;
