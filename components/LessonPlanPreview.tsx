
import React, { useState } from 'react';
import { LessonPlan, Session } from '../types.ts';
import { 
  Download, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Layers, 
  User, 
  ClipboardList, 
  School, 
  ShieldCheck, 
  Zap, 
  Briefcase, 
  Calendar,
  ChevronDown,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  plan: LessonPlan;
}

const LessonPlanPreview: React.FC<Props> = ({ plan }) => {
  const [isExporting, setIsExporting] = useState(false);

  const safeArray = (arr: any): any[] => Array.isArray(arr) ? arr : [];

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;

      // Banner Superior de Color (Degradado sim/sim en PDF es via rects)
      doc.setFillColor(79, 70, 229); // Brand 600
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Detalles Blancos sobre Color
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(plan.nombre_escuela.toUpperCase(), margin, 18);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`CCT: ${plan.cct || 'N/A'} | ZONA: ${plan.zona_escolar || 'N/A'} | DOCENTE: ${plan.nombre_docente.toUpperCase()}`, margin, 24);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${plan.grado.toUpperCase()} - ${plan.fase_nem.toUpperCase()} | METODOLOGÍA: ${plan.metodologia.toUpperCase()}`, margin, 32);

      doc.setFontSize(14);
      const titleLines = doc.splitTextToSize(`PROYECTO: ${plan.titulo_proyecto}`, pageWidth - 30);
      doc.text(titleLines, margin, 42);

      let currentY = 58;

      // Diagnóstico y Propósito con Acentos de Color
      doc.setFillColor(248, 250, 252); // Bg slate 50
      doc.rect(margin, currentY, pageWidth - 30, 25, 'F');
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text("SITUACIÓN PROBLEMÁTICA", margin + 5, currentY + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const diagLines = doc.splitTextToSize(plan.diagnostico_socioeducativo, pageWidth - 45);
      doc.text(diagLines, margin + 5, currentY + 12);
      
      currentY += 35;

      // Tablas de Estructura Curricular
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, halign: 'center' },
        body: [
          ["CAMPOS FORMATIVOS", safeArray(plan.campo_formativo).join(', ')],
          ["EJES ARTICULADORES", safeArray(plan.ejes_articuladores).join(', ')],
          ["PROPÓSITO", plan.proposito]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
        columnStyles: { 0: { fontStyle: 'bold', width: 40, fillColor: [238, 242, 255] } }
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      // Fases y Sesiones
      safeArray(plan.fases_desarrollo).forEach((f) => {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        
        doc.setFillColor(243, 244, 246);
        doc.rect(margin, currentY - 5, pageWidth - 30, 10, 'F');
        doc.setTextColor(67, 56, 202); // Indigo 700
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(f.nombre.toUpperCase(), margin + 5, currentY + 2);
        currentY += 12;

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [99, 102, 241], fontSize: 8 }, // Accent indigo
          body: safeArray(f.sesiones).map((s: Session) => [
            `S${s.numero}`,
            `${s.titulo}\n\nInicio: ${safeArray(s.actividades_inicio).join(' ')}\nDesarrollo: ${safeArray(s.actividades_desarrollo).join(' ')}\nCierre: ${safeArray(s.actividades_cierre).join(' ')}\n\nRecursos: ${safeArray(s.recursos).join(', ')}`
          ]),
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 5 },
          columnStyles: { 0: { width: 15, fontStyle: 'bold', halign: 'center', fillColor: [249, 250, 251] } }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      });

      doc.save(`Proyecto_NEM_${plan.titulo_proyecto.substring(0,25)}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Cabecera de Visor Editorial */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 pb-12 border-b-2 border-slate-100 relative">
        <div className="absolute -top-10 left-0 text-[120px] font-black text-slate-50 opacity-[0.03] select-none uppercase pointer-events-none">Proyecto</div>
        <div className="space-y-6 text-center md:text-left relative z-10">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="bg-brand-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-100">
              {plan.metodologia}
            </span>
            <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100">
              Fase {plan.fase_nem}
            </span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">
            {plan.titulo_proyecto}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-inner">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Docente</p>
                <span className="text-sm font-black text-slate-800">{plan.nombre_docente}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-inner">
                <School className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Institución</p>
                <span className="text-sm font-black text-slate-800">{plan.nombre_escuela}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={exportToPDF}
          disabled={isExporting}
          className="group relative bg-slate-900 hover:bg-brand-600 text-white p-1 rounded-[2rem] transition-all hover:scale-105 shadow-2xl shadow-slate-200"
        >
          <div className="bg-slate-900 group-hover:bg-brand-600 px-10 py-8 rounded-[1.8rem] flex flex-col items-center gap-2 border border-white/10 transition-colors">
            {isExporting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Download className="w-7 h-7" />}
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Exportar PDF</span>
          </div>
        </button>
      </div>

      {/* Grid de Resumen Pedagógico con Color */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 hover:bg-indigo-50 transition-colors">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Campos Formativos</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {safeArray(plan.campo_formativo).map((c, i) => (
              <span key={i} className="text-[10px] font-black text-indigo-700 bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">{c}</span>
            ))}
          </div>
        </div>
        
        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 hover:bg-emerald-50 transition-colors">
          <div className="flex items-center gap-3 mb-6 text-emerald-600">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Ejes Articuladores</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {safeArray(plan.ejes_articuladores).map((e, i) => (
              <span key={i} className="text-[10px] font-black text-emerald-700 bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">{e}</span>
            ))}
          </div>
        </div>

        <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 hover:bg-amber-50 transition-colors">
          <div className="flex items-center gap-3 mb-6 text-amber-600">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Propósito Situado</h4>
          </div>
          <p className="text-xs font-bold text-amber-800 leading-relaxed italic">"{plan.proposito}"</p>
        </div>
      </div>

      {/* Secuencia Didáctica - Estilo Editorial Colorido */}
      <div className="space-y-12">
        <div className="flex items-center gap-6">
          <div className="bg-brand-50 px-4 py-2 rounded-xl border border-brand-100">
             <h3 className="text-lg font-black text-brand-600 tracking-tight uppercase tracking-widest">Plan de Acción</h3>
          </div>
          <div className="h-px bg-slate-100 flex-1"></div>
        </div>

        {safeArray(plan.fases_desarrollo).map((fase, i) => (
          <div key={i} className="group">
            <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-100 hover:border-brand-200 transition-all duration-500">
              <div className="bg-gradient-to-r from-slate-50 to-white px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-2 h-8 bg-brand-500 rounded-full"></div>
                     <h4 className="text-sm font-black text-brand-600 uppercase tracking-[0.3em]">{fase.nombre}</h4>
                  </div>
                  <p className="text-sm font-bold text-slate-500 max-w-2xl leading-relaxed">{fase.descripcion}</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Estado</span>
                  <span className="text-[11px] font-black text-emerald-500 uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Estructurado
                  </span>
                </div>
              </div>

              <div className="p-0 divide-y divide-slate-50">
                {safeArray(fase.sesiones).map((s, si) => (
                  <div key={si} className="p-10 hover:bg-brand-50/10 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-12">
                      <div className="lg:w-20 flex-shrink-0 flex flex-col items-center">
                        <div className="bg-brand-600 text-white w-20 h-20 rounded-[1.8rem] flex flex-col items-center justify-center shadow-xl shadow-brand-100 relative group-hover:rotate-6 transition-transform">
                          <span className="text-[10px] font-black opacity-60">S-</span>
                          <span className="text-3xl font-black">{s.numero}</span>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center text-[10px] font-black">
                            <Zap className="w-3 h-3 fill-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-10">
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                             <h5 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{s.titulo}</h5>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                              <Clock className="w-4 h-4 text-brand-400" /> {s.duracion}
                            </span>
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-2 bg-brand-50 px-3 py-1 rounded-lg border border-brand-100">
                              <Info className="w-4 h-4" /> {s.evaluacion_sesion}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                          <div className="absolute top-0 left-1/3 bottom-0 w-px bg-slate-50 hidden md:block"></div>
                          <div className="absolute top-0 left-2/3 bottom-0 w-px bg-slate-50 hidden md:block"></div>
                          
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block">Apertura</span>
                            <ul className="space-y-3">
                              {safeArray(s.actividades_inicio).map((act, ai) => (
                                <li key={ai} className="text-xs font-bold text-slate-600 leading-relaxed flex gap-3">
                                  <span className="text-indigo-300">▸</span> {act}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] block">Desarrollo</span>
                            <ul className="space-y-3">
                              {safeArray(s.actividades_desarrollo).map((act, ai) => (
                                <li key={ai} className="text-xs font-black text-slate-800 leading-relaxed flex gap-3">
                                  <span className="text-emerald-400">▸</span> {act}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block">Cierre</span>
                            <ul className="space-y-3">
                              {safeArray(s.actividades_cierre).map((act, ai) => (
                                <li key={ai} className="text-xs font-bold text-slate-600 leading-relaxed flex gap-3">
                                  <span className="text-amber-400">▸</span> {act}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 flex flex-wrap items-center gap-6">
                           <div className="flex items-center gap-2">
                             <Briefcase className="w-4 h-4 text-slate-300" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recursos:</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                            {safeArray(s.recursos).map((rec, ri) => (
                              <span key={ri} className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hover:border-brand-300 transition-colors cursor-default">{rec}</span>
                            ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Evaluación Formativa Premium */}
      <div className="bg-gradient-to-br from-slate-900 to-brand-900 rounded-[3.5rem] p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full -mr-32 -mt-32 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full -ml-32 -mb-32 opacity-10 blur-3xl"></div>
        
        <div className="flex items-center gap-6 mb-16 relative z-10">
          <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/20">
            <ClipboardList className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight">Estrategia de Evaluación</h3>
            <p className="text-brand-300 text-xs font-black uppercase tracking-[0.3em] mt-1">Nivel Formativo NEM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          <div className="space-y-8 group">
            <h5 className="text-[11px] font-black text-brand-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4 group-hover:text-brand-300 transition-colors">Técnicas</h5>
            <div className="space-y-4">
              {safeArray(plan.evaluacion_formativa?.tecnicas).map((t, i) => (
                <div key={i} className="text-sm font-bold text-slate-300 flex items-center gap-4 hover:text-white transition-colors">
                  <div className="w-2 h-2 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50"></div> {t}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-8 group">
            <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4 group-hover:text-emerald-300 transition-colors">Instrumentos</h5>
            <div className="space-y-4">
              {safeArray(plan.evaluacion_formativa?.instrumentos).map((t, i) => (
                <div key={i} className="text-sm font-bold text-slate-300 flex items-center gap-4 hover:text-white transition-colors">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div> {t}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-8 group">
            <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4 group-hover:text-amber-300 transition-colors">Criterios Maestro</h5>
            <div className="space-y-4">
              {safeArray(plan.evaluacion_formativa?.criterios_evaluacion).map((t, i) => (
                <div key={i} className="text-sm font-black text-white flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" /> 
                  <span className="leading-relaxed italic">"{t}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanPreview;
