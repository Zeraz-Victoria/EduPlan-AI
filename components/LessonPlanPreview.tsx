
import React, { useState } from 'react';
import { LessonPlan, Session } from '../types';
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

      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
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

      doc.setFillColor(248, 250, 252);
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
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, fillColor: [238, 242, 255] } }
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      safeArray(plan.fases_desarrollo).forEach((f) => {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        
        doc.setFillColor(243, 244, 246);
        doc.rect(margin, currentY - 5, pageWidth - 30, 10, 'F');
        doc.setTextColor(67, 56, 202);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(f.nombre.toUpperCase(), margin + 5, currentY + 2);
        currentY += 12;

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
          body: safeArray(f.sesiones).map((s: Session) => [
            `S${s.numero}`,
            `${s.titulo}\n\nInicio: ${safeArray(s.actividades_inicio).join(' ')}\nDesarrollo: ${safeArray(s.actividades_desarrollo).join(' ')}\nCierre: ${safeArray(s.actividades_cierre).join(' ')}\n\nRecursos: ${safeArray(s.recursos).join(', ')}`
          ]),
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 5 },
          columnStyles: { 0: { cellWidth: 15, fontStyle: 'bold', halign: 'center', fillColor: [249, 250, 251] } }
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 pb-12 border-b-2 border-slate-100 relative">
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
              <User className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-black text-slate-800">{plan.nombre_docente}</span>
            </div>
            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-black text-slate-800">{plan.nombre_escuela}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={exportToPDF}
          disabled={isExporting}
          className="bg-slate-900 hover:bg-brand-600 text-white px-10 py-8 rounded-[1.8rem] flex flex-col items-center gap-2 transition-all shadow-2xl"
        >
          {isExporting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Download className="w-7 h-7" />}
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Exportar PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100">
          <Layers className="w-5 h-5 text-indigo-600 mb-4" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4">Campos Formativos</h4>
          <div className="flex flex-wrap gap-2">
            {safeArray(plan.campo_formativo).map((c, i) => (
              <span key={i} className="text-[10px] font-black text-indigo-700 bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">{c}</span>
            ))}
          </div>
        </div>
        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mb-4" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4">Ejes Articuladores</h4>
          <div className="flex flex-wrap gap-2">
            {safeArray(plan.ejes_articuladores).map((e, i) => (
              <span key={i} className="text-[10px] font-black text-emerald-700 bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">{e}</span>
            ))}
          </div>
        </div>
        <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100">
          <Calendar className="w-5 h-5 text-amber-600 mb-4" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4">Propósito</h4>
          <p className="text-xs font-bold text-amber-800 leading-relaxed italic">"{plan.proposito}"</p>
        </div>
      </div>

      <div className="space-y-12">
        {safeArray(plan.fases_desarrollo).map((fase, i) => (
          <div key={i} className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="px-10 py-8 border-b border-slate-100">
              <h4 className="text-sm font-black text-brand-600 uppercase tracking-[0.3em]">{fase.nombre}</h4>
              <p className="text-sm font-bold text-slate-500 mt-2">{fase.descripcion}</p>
            </div>
            <div className="divide-y divide-slate-50">
              {safeArray(fase.sesiones).map((s, si) => (
                <div key={si} className="p-10 hover:bg-brand-50/10 transition-all">
                  <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-20 text-center">
                      <div className="bg-brand-600 text-white w-20 h-20 rounded-[1.8rem] flex flex-col items-center justify-center mx-auto shadow-xl">
                        <span className="text-[10px] font-black opacity-60">S-</span>
                        <span className="text-3xl font-black">{s.numero}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-8">
                      <h5 className="text-2xl font-black text-slate-900 tracking-tight">{s.titulo}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-3">Inicio</span>
                          <ul className="space-y-2">
                            {safeArray(s.actividades_inicio).map((act, ai) => (
                              <li key={ai} className="text-xs font-bold text-slate-600 leading-relaxed">• {act}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] block mb-3">Desarrollo</span>
                          <ul className="space-y-2">
                            {safeArray(s.actividades_desarrollo).map((act, ai) => (
                              <li key={ai} className="text-xs font-black text-slate-800 leading-relaxed">• {act}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block mb-3">Cierre</span>
                          <ul className="space-y-2">
                            {safeArray(s.actividades_cierre).map((act, ai) => (
                              <li key={ai} className="text-xs font-bold text-slate-600 leading-relaxed">• {act}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white shadow-2xl">
        <div className="flex items-center gap-6 mb-16">
          <ClipboardList className="w-8 h-8 text-brand-400" />
          <h3 className="text-3xl font-black tracking-tight">Evaluación Formativa</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-brand-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4">Técnicas</h5>
            <ul className="space-y-3">
              {safeArray(plan.evaluacion_formativa?.tecnicas).map((t, i) => (
                <li key={i} className="text-sm font-bold text-slate-300">• {t}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4">Instrumentos</h5>
            <ul className="space-y-3">
              {safeArray(plan.evaluacion_formativa?.instrumentos).map((t, i) => (
                <li key={i} className="text-sm font-bold text-slate-300">• {t}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4">Criterios</h5>
            <ul className="space-y-4">
              {safeArray(plan.evaluacion_formativa?.criterios_evaluacion).map((t, i) => (
                <li key={i} className="text-sm font-black text-white bg-white/5 p-4 rounded-2xl border border-white/5 italic">"{t}"</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanPreview;
