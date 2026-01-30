
import React, { useState } from 'react';
import { LessonPlan, ContentPdaPair, Evaluation, Session } from '../types.ts';
import { Download, GraduationCap, Clock, Sparkles, CheckCircle2, Loader2, BookOpen, Layers, Bookmark, User, Target, ClipboardList, School, AlertTriangle, Quote, ShieldCheck, Zap, Briefcase, BookMarked, Globe, Building2, Map } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  plan: LessonPlan;
}

const LessonPlanPreview: React.FC<Props> = ({ plan }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!plan || typeof plan !== 'object' || !plan.titulo_proyecto) {
    return (
      <div className="bg-slate-800 border border-amber-500/50 p-12 rounded-[3rem] text-center max-w-2xl mx-auto shadow-2xl">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
        <h3 className="text-2xl font-black text-white mb-4">Validando Plano Didáctico</h3>
        <p className="text-slate-400 font-medium">Estamos preparando los datos para su visualización...</p>
      </div>
    );
  }

  const safeArray = (arr: any): any[] => Array.isArray(arr) ? arr : [];

  const vinculacion = safeArray(plan.vinculacion_contenido_pda);
  const fases = safeArray(plan.fases_desarrollo);
  const bibliografia = safeArray(plan.bibliografia_especializada);
  const ejes = safeArray(plan.ejes_articuladores);
  const campos = safeArray(plan.campo_formativo);
  const evaluacion = plan.evaluacion_formativa || { tecnicas: [], instrumentos: [], criterios_evaluacion: [] };

  const groupedByAsignatura = vinculacion.reduce((acc: Record<string, any[]>, curr) => {
    const key = curr?.asignatura || "Campo Formativo";
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const exportToPDF = async () => {
    setExportError(null);
    setIsExporting(true);
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 18;
      const primaryColor = [15, 23, 42] as [number, number, number]; // Slate 900
      
      // HEADER DESIGN
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 55, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(plan.nombre_escuela.toUpperCase(), margin, 16);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      doc.text(`C.C.T: ${plan.cct || 'N/A'}  |  ZONA ESCOLAR: ${plan.zona_escolar || 'N/A'}`, margin, 22);
      doc.text("SUBSECRETARÍA DE EDUCACIÓN BÁSICA | PLANO DIDÁCTICO (NEM)", margin, 27);
      
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`DOCENTE: ${plan.nombre_docente.toUpperCase()}`, margin, 35);
      doc.text(`${plan.grado} | ${plan.fase_nem} | METODOLOGÍA: ${plan.metodologia.toUpperCase()}`, margin, 40);
      
      // PROYECTO TITLE - WRAPPED TO PREVENT OVERFLOW
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      const splitTitle = doc.splitTextToSize(`PROYECTO: ${plan.titulo_proyecto.toUpperCase()}`, pageWidth - (margin * 2.5));
      doc.text(splitTitle, margin, 48);
      
      let currentY = 62;

      // I. FUNDAMENTACIÓN
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(10);
      doc.text("I. FUNDAMENTACIÓN Y CONTEXTO", margin, currentY);
      
      autoTable(doc, {
        startY: currentY + 3,
        margin: { left: margin, right: margin },
        body: [
          ["DIAGNÓSTICO", plan.diagnostico_socioeducativo],
          ["PROPÓSITO", plan.proposito],
          ["CAMPOS", campos.join(' | ')],
          ["EJES", ejes.join(' | ')]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
        columnStyles: { 0: { fontStyle: 'bold', width: 35, fillColor: [241, 245, 249] } }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;

      // II. MALLA CURRICULAR
      doc.text("II. MALLA CURRICULAR VINCULADA", margin, currentY);
      currentY += 4;
      
      Object.entries(groupedByAsignatura).forEach(([asig, items]) => {
        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [[{ content: asig.toUpperCase(), colSpan: 2, styles: { fillColor: [51, 65, 85] } }]],
          body: (items as any[]).flatMap(pair => {
            const pdas = safeArray(pair.pda_vinculados);
            return pdas.map((pda, i) => [
              i === 0 ? pair.contenido : "",
              `• ${pda}`
            ]);
          }),
          theme: 'grid',
          styles: { fontSize: 7.5, cellPadding: 2 },
          columnStyles: { 0: { fontStyle: 'bold', width: 55, fillColor: [250, 250, 250] } }
        });
        currentY = (doc as any).lastAutoTable.finalY + 6;
        if (currentY > 265) { doc.addPage(); currentY = 20; }
      });

      // III. SECUENCIA DIDÁCTICA
      doc.addPage();
      currentY = 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("III. PLANO DIDÁCTICO (ACTIVIDADES)", margin, currentY);
      currentY += 6;
      
      fases.forEach((f) => {
        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [[{ content: f.nombre.toUpperCase(), colSpan: 2, styles: { fillColor: primaryColor, halign: 'left' } }]],
          body: safeArray(f.sesiones).map((s: Session) => [
            { content: `SESIÓN ${s.numero}\n${s.duracion}`, styles: { halign: 'center', fontStyle: 'bold', fontSize: 7 } },
            `TÍTULO: ${s.titulo.toUpperCase()}\n\n` +
            `• INICIO: ${safeArray(s.actividades_inicio).join(' ')}\n\n` +
            `• DESARROLLO: ${safeArray(s.actividades_desarrollo).join(' ')}\n\n` +
            `• CIERRE: ${safeArray(s.actividades_cierre).join(' ')}\n\n` +
            `RECURSOS: ${safeArray(s.recursos).join(', ')}\n` +
            `EVALUACIÓN: ${s.evaluacion_sesion}`
          ]),
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
          columnStyles: { 0: { width: 20 } },
          headStyles: { textColor: [255, 255, 255] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 8;
        if (currentY > 250) { doc.addPage(); currentY = 20; }
      });

      // IV. EVALUACIÓN Y CIERRE
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(10);
      doc.text("IV. EVALUACIÓN Y BIBLIOGRAFÍA", margin, currentY);
      
      autoTable(doc, {
        startY: currentY + 4,
        margin: { left: margin, right: margin },
        head: [['TÉCNICAS', 'INSTRUMENTOS', 'CRITERIOS']],
        body: [[
          safeArray(evaluacion.tecnicas).join('\n'),
          safeArray(evaluacion.instrumentos).join('\n'),
          safeArray(evaluacion.criterios_evaluacion).join('\n')
        ]],
        theme: 'grid',
        styles: { fontSize: 7.5 },
        headStyles: { fillColor: [51, 65, 85] }
      });
      
      // Page numbering
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`Hoja ${i} de ${totalPages} | Planeador Maestro NEM Pro+`, pageWidth / 2, 287, { align: 'center' });
      }

      doc.save(`Planeacion_NEM_${plan.titulo_proyecto.substring(0,15).replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      setExportError("Error al generar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20">
      {/* Visualización de Cabecera */}
      <div className="bg-slate-800/95 border border-white/10 p-12 lg:p-16 rounded-[4rem] shadow-3xl backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Globe className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">
                {plan.metodologia}
              </span>
              <span className="bg-slate-700/50 text-slate-300 border border-white/10 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Fase {plan.fase_nem}
              </span>
            </div>
            <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]">{plan.titulo_proyecto}</h2>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">{plan.nombre_docente}</span>
              </div>
              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">{plan.nombre_escuela}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">CCT: {plan.cct || 'S/C'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Map className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">Zona: {plan.zona_escolar || 'S/Z'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={exportToPDF} 
            disabled={isExporting}
            className="group flex flex-col items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white w-full lg:w-56 h-56 rounded-[4rem] font-black transition-all shadow-indigo-600/40 shadow-2xl active:scale-95 disabled:bg-slate-700"
          >
            {isExporting ? <Loader2 className="w-12 h-12 animate-spin" /> : <Download className="w-12 h-12" />}
            <div className="text-center">
              <p className="text-[12px] uppercase tracking-widest mb-1">Descargar</p>
              <p className="text-[9px] opacity-70">PLANO DIDÁCTICO</p>
            </div>
          </button>
        </div>
      </div>

      {/* Resumen Curricular: Campos y Ejes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-xl">
          <h3 className="text-[11px] font-black text-indigo-400 flex items-center gap-4 mb-8 uppercase tracking-[0.4em]">
            <Layers className="w-6 h-6" /> Campos Formativos
          </h3>
          <div className="flex flex-wrap gap-3">
            {campos.map((c, i) => (
              <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl text-xs font-bold text-indigo-300 flex items-center gap-3">
                <Zap className="w-4 h-4" /> {c}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/40 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-xl">
          <h3 className="text-[11px] font-black text-emerald-400 flex items-center gap-4 mb-8 uppercase tracking-[0.4em]">
            <Briefcase className="w-6 h-6" /> Ejes Articuladores
          </h3>
          <div className="flex flex-wrap gap-3">
            {ejes.map((e, i) => (
              <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" /> {e}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secuencia Didáctica - DISEÑO VERTICAL MEJORADO */}
      <div className="space-y-12">
        <div className="flex items-center gap-8 px-8">
           <h3 className="text-xl font-black text-white uppercase tracking-[0.3em]">Desarrollo del Plano Didáctico</h3>
           <div className="h-px bg-white/10 flex-1" />
        </div>
        
        {fases.map((fase, i) => (
          <div key={i} className="bg-slate-800/20 border border-white/5 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden">
            <div className="mb-16 relative z-10">
              <div className="inline-flex items-center gap-3 bg-indigo-600/20 border border-indigo-600/40 px-8 py-3 rounded-3xl mb-8">
                <span className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">{fase?.nombre}</span>
              </div>
              <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-4xl border-l-4 border-indigo-600 pl-8">{fase?.descripcion}</p>
            </div>
            
            <div className="space-y-12 relative z-10">
              {safeArray(fase?.sesiones).map((s, si) => (
                <div key={si} className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 hover:border-indigo-600/30 transition-all shadow-xl group">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 mb-12 border-b border-white/5 pb-10">
                    <div className="bg-indigo-600 text-white w-24 h-24 rounded-[2.5rem] flex flex-col items-center justify-center font-black shadow-lg shrink-0">
                      <span className="text-[10px] opacity-70">SESIÓN</span>
                      <span className="text-4xl">{s?.numero}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-3xl font-black text-white tracking-tight leading-none mb-4">{s?.titulo || 'Actividad de Aprendizaje'}</h5>
                      <div className="flex gap-6">
                        <span className="text-[11px] text-slate-500 font-bold uppercase flex items-center gap-2"><Clock className="w-4 h-4" /> {s?.duracion}</span>
                        <span className="text-[11px] text-indigo-400 font-bold uppercase flex items-center gap-2"><Zap className="w-4 h-4" /> {s?.evaluacion_sesion}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Grid de Actividades con mejor legibilidad */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Inicio / Apertura</span>
                      </div>
                      <div className="space-y-4">
                        {safeArray(s?.actividades_inicio).map((a, ai) => (
                          <div key={ai} className="flex gap-4 group/item">
                            <span className="text-emerald-500 font-black">•</span>
                            <p className="text-[14px] text-slate-400 leading-relaxed font-medium">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-6 bg-indigo-600/5 p-8 rounded-[3rem] border border-indigo-600/10">
                      <div className="flex items-center gap-3 border-b border-indigo-400/20 pb-4">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Desarrollo</span>
                      </div>
                      <div className="space-y-4">
                        {safeArray(s?.actividades_desarrollo).map((a, ai) => (
                          <div key={ai} className="flex gap-4">
                            <span className="text-indigo-400 font-black">•</span>
                            <p className="text-[14px] text-slate-200 font-bold leading-relaxed">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Cierre / Evaluación</span>
                      </div>
                      <div className="space-y-4">
                        {safeArray(s?.actividades_cierre).map((a, ai) => (
                          <div key={ai} className="flex gap-4">
                            <span className="text-amber-500 font-black">•</span>
                            <p className="text-[14px] text-slate-400 leading-relaxed font-medium">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-indigo-400" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Recursos:</span>
                      <div className="flex flex-wrap gap-2">
                         {safeArray(s?.recursos).map((r, ri) => (
                           <span key={ri} className="bg-white/5 px-4 py-1.5 rounded-xl text-[10px] font-bold text-slate-300 border border-white/5">{r}</span>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Evaluación Formativa Final */}
      <div className="bg-indigo-600/10 border border-indigo-600/20 p-16 rounded-[4rem] shadow-2xl">
         <h3 className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
            <ClipboardList className="w-8 h-8" /> Sistema de Evaluación Formativa
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <span className="text-[10px] text-slate-500 uppercase font-black block tracking-widest">Técnicas</span>
              <ul className="space-y-3">
                {safeArray(evaluacion.tecnicas).map((t, i) => (
                  <li key={i} className="text-white font-bold text-sm flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <span className="text-[10px] text-slate-500 uppercase font-black block tracking-widest">Instrumentos</span>
              <ul className="space-y-3">
                {safeArray(evaluacion.instrumentos).map((t, i) => (
                  <li key={i} className="text-white font-bold text-sm flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <span className="text-[10px] text-slate-500 uppercase font-black block tracking-widest">Criterios de Evaluación</span>
              <ul className="space-y-3">
                {safeArray(evaluacion.criterios_evaluacion).map((t, i) => (
                  <li key={i} className="text-white font-bold text-sm flex items-center gap-3 italic">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> {t}
                  </li>
                ))}
              </ul>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LessonPlanPreview;
