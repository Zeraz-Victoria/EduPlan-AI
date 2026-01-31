
import React, { useState, useEffect } from 'react';
import { FASES_NEM, METODOLOGIAS, GRADOS_FLAT } from './constants';
import { Methodology, LessonPlan } from './types';
import { generateLessonPlanStream } from './services/geminiService';
import LessonPlanPreview from './components/LessonPlanPreview';
import { 
  GraduationCap, 
  Loader2, 
  BookOpen, 
  Zap, 
  XCircle, 
  Brain, 
  Layers, 
  School, 
  ListOrdered, 
  MessageSquareText,
  Sparkles
} from 'lucide-react';

const LOADING_STEPS = [
  "Sintetizando bases pedagógicas...",
  "Analizando grado y fase escolar...",
  "Vinculando PDA y Contenidos...",
  "Diseñando secuencia didáctica...",
  "Generando evaluación formativa...",
  "Finalizando plano didáctico..."
];

const App: React.FC = () => {
  const [nombreDocente, setNombreDocente] = useState('');
  const [nombreEscuela, setNombreEscuela] = useState('');
  const [cct, setCct] = useState('');
  const [zonaEscolar, setZonaEscolar] = useState('');
  const [grado, setGrado] = useState('1° Secundaria');
  const [faseId, setFaseId] = useState('Fase 6');
  const [metodologia, setMetodologia] = useState<Methodology>(METODOLOGIAS[0]);
  const [numSesiones, setNumSesiones] = useState(10);
  const [contexto, setContexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGradoChange = (nuevoGrado: string) => {
    setGrado(nuevoGrado);
    const infoGrado = GRADOS_FLAT.find(g => g.grado === nuevoGrado);
    if (infoGrado) setFaseId(infoGrado.faseId);
  };

  const handleGenerate = async () => {
    if (!nombreDocente || !nombreEscuela) {
      setError("Por favor completa los datos del docente y la escuela.");
      return;
    }

    setLoading(true);
    setError(null);
    setLessonPlan(null);

    try {
      const result = await generateLessonPlanStream(
        { 
          nombreDocente, 
          nombreEscuela, 
          cct, 
          zonaEscolar, 
          fase: faseId, 
          grado, 
          metodologia, 
          contextoAdicional: contexto, 
          numSesiones 
        },
        () => {}
      );

      setLessonPlan({ ...result, nombre_docente: nombreDocente, nombre_escuela: nombreEscuela, cct, zona_escolar: zonaEscolar });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <aside className="w-[380px] bg-white border-r border-slate-200 flex flex-col shadow-xl z-50">
        <div className="p-8 border-b border-slate-100 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative z-10 flex items-center gap-3 mb-1">
            <div className="bg-gradient-brand p-2.5 rounded-xl text-white shadow-lg shadow-brand-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="font-extrabold text-xl text-slate-900 tracking-tight">Maestro <span className="text-brand-600">NEM</span></h1>
          </div>
          <p className="relative z-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">Codiseño Inteligente</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <School className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Institución</h3>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Nombre de la escuela" 
                value={nombreEscuela}
                onChange={e => setNombreEscuela(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-slate-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="CCT" 
                  value={cct}
                  onChange={e => setCct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-slate-400"
                />
                <input 
                  type="text" 
                  placeholder="Zona" 
                  value={zonaEscolar}
                  onChange={e => setZonaEscolar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <input 
                type="text" 
                placeholder="Nombre del Docente" 
                value={nombreDocente}
                onChange={e => setNombreDocente(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-semibold"
              />
            </div>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Layers className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Estructura</h3>
            </div>
            <div className="space-y-3">
              <select 
                value={grado} 
                onChange={e => handleGradoChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-brand-500/10 appearance-none font-medium text-slate-700 cursor-pointer"
              >
                {FASES_NEM.map(f => (
                  <optgroup key={f.id} label={f.nombre}>
                    {f.grados.map(g => <option key={g} value={g}>{g}</option>)}
                  </optgroup>
                ))}
              </select>
              <select 
                value={metodologia} 
                onChange={e => setMetodologia(e.target.value as Methodology)}
                className="w-full bg-brand-50 border-2 border-brand-100 rounded-xl px-4 py-3 text-sm outline-none text-brand-700 font-bold cursor-pointer hover:bg-brand-100/50 transition-colors"
              >
                {METODOLOGIAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex items-center justify-between px-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                   <ListOrdered className="w-3.5 h-3.5" /> Sesiones:
                </span>
                <input 
                  type="number" 
                  value={numSesiones} 
                  onChange={e => setNumSesiones(parseInt(e.target.value) || 1)}
                  className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center text-sm font-black text-brand-600"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <MessageSquareText className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Diagnóstico Situacional</h3>
            </div>
            <div className="space-y-3">
              <textarea 
                placeholder="Ej: Problemas de basura en la comunidad, falta de hábitos de higiene, necesidades de lectoescritura..."
                value={contexto}
                onChange={e => setContexto(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-brand-500/10 h-44 resize-none leading-relaxed text-slate-700 placeholder:text-slate-400 font-medium"
              />
              <div className="flex items-center gap-2 px-1 text-[10px] text-brand-400 font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> IA Lista para contextualizar
              </div>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex gap-3 animate-in fade-in slide-in-from-top-2">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" /> 
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-brand hover:scale-[1.02] text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-3 tracking-widest text-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
            {loading ? 'PROCESANDO...' : 'GENERAR PROYECTO'}
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-[#fcfcfd] relative overflow-y-auto custom-scrollbar">
        {!lessonPlan && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-20 animate-in fade-in zoom-in-95">
            <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-slate-200 relative">
               <div className="absolute inset-0 bg-brand-50 rounded-[2rem] animate-pulse"></div>
               <BookOpen className="w-12 h-12 text-brand-500 relative z-10" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Lienzo Pedagógico</h2>
            <p className="text-slate-500 max-w-md leading-relaxed font-bold text-lg">
              Tu planeación de codiseño aparecerá aquí con toda la estructura oficial de la NEM.
            </p>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center p-20 bg-white">
            <div className="relative mb-14">
              <div className="w-32 h-32 border-[4px] border-slate-100 border-t-brand-600 rounded-full animate-spin shadow-inner"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center animate-pulse shadow-sm">
                   <Brain className="w-8 h-8 text-brand-600" />
                 </div>
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Arquitectura Pedagógica NEM</h3>
            <p className="text-brand-600 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>
        )}

        {lessonPlan && (
          <div className="p-10 lg:p-16 animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <LessonPlanPreview plan={lessonPlan} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
