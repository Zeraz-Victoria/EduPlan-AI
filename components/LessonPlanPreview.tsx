
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
  Info,
  BookMarked,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  HeadingLevel, 
  AlignmentType, 
  ShadingType,
  VerticalAlign
} from 'docx';

interface Props {
  plan: LessonPlan;
}

const LessonPlanPreview: React.FC<Props> = ({ plan }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  const safeArray = (arr: any): any[] => Array.isArray(arr) ? arr : [];
  const safeStr = (val: any, fallback: string = 'N/A') => (val && val !== 'undefined') ? String(val) : fallback;

  const exportToWord = async () => {
    setIsExportingWord(true);
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Encabezado
            new Paragraph({
              text: safeStr(plan.titulo_proyecto).toUpperCase(),
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `ESCUELA: ${safeStr(plan.nombre_escuela)}`, bold: true }),
                new TextRun({ text: ` | DOCENTE: ${safeStr(plan.nombre_docente)}`, bold: true }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Fase: ${safeStr(plan.fase_nem)} | Metodología: ${safeStr(plan.metodologia)}`, italics: true }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Diagnóstico
            new Paragraph({ text: "DIAGNÓSTICO SOCIOEDUCATIVO", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: safeStr(plan.diagnostico_socioeducativo), spacing: { after: 300 } }),

            // Elementos Curriculares
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph({ children: [new TextRun({ text: "CAMPO FORMATIVO", bold: true })] })], 
                      shading: { fill: "F1F5F9", type: ShadingType.CLEAR } 
                    }),
                    new TableCell({ children: [new Paragraph({ text: safeArray(plan.campo_formativo).join(", ") })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph({ children: [new TextRun({ text: "EJES ARTICULADORES", bold: true })] })], 
                      shading: { fill: "F1F5F9", type: ShadingType.CLEAR } 
                    }),
                    new TableCell({ children: [new Paragraph({ text: safeArray(plan.ejes_articuladores).join(", ") })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph({ children: [new TextRun({ text: "PROPÓSITO", bold: true })] })], 
                      shading: { fill: "F1F5F9", type: ShadingType.CLEAR } 
                    }),
                    new TableCell({ children: [new Paragraph({ text: safeStr(plan.proposito) })] }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: "", spacing: { before: 400 } }),

            // Secuencia Didáctica
            new Paragraph({ text: "SECUENCIA DIDÁCTICA", heading: HeadingLevel.HEADING_2 }),
            ...safeArray(plan.fases_desarrollo).flatMap((fase) => [
              new Paragraph({ 
                text: safeStr(fase.nombre).toUpperCase(), 
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 }
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ 
                        children: [new Paragraph({ children: [new TextRun({ text: "Sesión", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], 
                        width: { size: 10, type: WidthType.PERCENTAGE }, 
                        shading: { fill: "334155", type: ShadingType.CLEAR } 
                      }),
                      new TableCell({ 
                        children: [new Paragraph({ children: [new TextRun({ text: "Actividades", bold: true, color: "FFFFFF" })] })], 
                        width: { size: 90, type: WidthType.PERCENTAGE }, 
                        shading: { fill: "334155", type: ShadingType.CLEAR } 
                      }),
                    ],
                  }),
                  ...safeArray(fase.sesiones).map((s: Session) => 
                    new TableRow({
                      children: [
                        new TableCell({ 
                          children: [new Paragraph({ children: [new TextRun({ text: String(s.numero), bold: true })], alignment: AlignmentType.CENTER })],
                          verticalAlign: VerticalAlign.CENTER
                        }),
                        new TableCell({ 
                          children: [
                            new Paragraph({ children: [new TextRun({ text: safeStr(s.titulo).toUpperCase(), bold: true })], spacing: { after: 100 } }),
                            new Paragraph({ children: [new TextRun({ text: "Inicio: ", bold: true }), new TextRun({ text: safeArray(s.actividades_inicio).join(" ") })], spacing: { after: 50 } }),
                            new Paragraph({ children: [new TextRun({ text: "Desarrollo: ", bold: true }), new TextRun({ text: safeArray(s.actividades_desarrollo).join(" ") })], spacing: { after: 50 } }),
                            new Paragraph({ children: [new TextRun({ text: "Cierre: ", bold: true }), new TextRun({ text: safeArray(s.actividades_cierre).join(" ") })], spacing: { after: 100 } }),
                            new Paragraph({ children: [new TextRun({ text: "Recursos: ", italics: true }), new TextRun({ text: safeArray(s.recursos).join(", ") })] }),
                          ]
                        }),
                      ],
                    })
                  ),
                ],
              }),
            ]),

            new Paragraph({ text: "", spacing: { before: 400 } }),

            // Evaluación
            new Paragraph({ text: "EVALUACIÓN FORMATIVA", heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Técnicas", bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ text: safeArray(plan.evaluacion_formativa?.tecnicas).join(", ") })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Instrumentos", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: safeArray(plan.evaluacion_formativa?.instrumentos).join(", ") })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Criterios", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ text: safeArray(plan.evaluacion_formativa?.criterios_evaluacion).join(". ") })] }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: "", spacing: { before: 400 } }),

            // Bibliografía
            ...(safeArray(plan.bibliografia_especializada).length > 0 ? [
              new Paragraph({ text: "BIBLIOGRAFÍA Y REFERENCIAS", heading: HeadingLevel.HEADING_2 }),
              ...safeArray(plan.bibliografia_especializada).map(b => 
                new Paragraph({ 
                  children: [
                    new TextRun({ text: `• ${safeStr(b.autor, "Anónimo")} (${safeStr(b.año, "S/F")}). ` }),
                    new TextRun({ text: `"${safeStr(b.titulo, "Sin título")}"`, bold: true }),
                    new TextRun({ text: `. Uso: ${safeStr(b.uso, "Referencia")}` })
                  ],
                  spacing: { after: 50 } 
                })
              )
            ] : []),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Planeacion_NEM_${plan.titulo_proyecto.replace(/\s+/g, '_')}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar Word:", err);
    } finally {
      setIsExportingWord(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      const headerStyles: any = { fillColor: [79, 70, 229], textColor: 255, fontSize: 10, fontStyle: 'bold' };
      const bodyStyles: any = { fontSize: 9, cellPadding: 5 };

      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      const titleLines = doc.splitTextToSize(safeStr(plan.titulo_proyecto).toUpperCase(), contentWidth - 20);
      doc.text(titleLines, margin, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`ESC: ${safeStr(plan.nombre_escuela)} | CCT: ${safeStr(plan.cct)}`, margin, 45);
      doc.text(`DOCENTE: ${safeStr(plan.nombre_docente)} | ZONA: ${safeStr(plan.zona_escolar)}`, margin, 50);

      doc.setFillColor(67, 56, 202);
      doc.roundedRect(margin, 53, 50, 6, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(safeStr(plan.metodologia).toUpperCase(), margin + 3, 57.2);

      doc.setFillColor(16, 185, 129);
      doc.roundedRect(margin + 55, 53, 25, 6, 3, 3, 'F');
      doc.text(`FASE ${safeStr(plan.fase_nem)}`, margin + 58, 57.2);

      let currentY = 70;

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['DIAGNÓSTICO SOCIOEDUCATIVO']],
        body: [[safeStr(plan.diagnostico_socioeducativo)]],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 6, fontStyle: 'normal' }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['ELEMENTO', 'CONTENIDO']],
        body: [
          ['CAMPOS FORMATIVOS', safeArray(plan.campo_formativo).join(', ')],
          ['EJES ARTICULADORES', safeArray(plan.ejes_articuladores).join(', ')],
          ['PROPÓSITO', safeStr(plan.proposito)]
        ],
        theme: 'grid',
        headStyles: headerStyles,
        styles: bodyStyles,
        columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold', fillColor: [249, 250, 251] } }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("PLAN DE ACCIÓN (SECUENCIA DIDÁCTICA)", margin, currentY);
      currentY += 5;

      safeArray(plan.fases_desarrollo).forEach((fase) => {
        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          body: [[{ content: safeStr(fase.nombre).toUpperCase(), styles: { fillColor: [238, 242, 255], textColor: [67, 56, 202], fontStyle: 'bold', fontSize: 11 } }]],
          theme: 'plain'
        });
        currentY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [['SESIÓN', 'DESARROLLO DE ACTIVIDADES']],
          body: safeArray(fase.sesiones).map((s: Session) => [
            { content: `S-${s.numero}\n${safeStr(s.duracion)}`, styles: { halign: 'center', fontStyle: 'bold' } },
            {
              content: `${safeStr(s.titulo).toUpperCase()}\n\n` +
                       `INICIO:\n${safeArray(s.actividades_inicio).map(a => ' • ' + a).join('\n')}\n\n` +
                       `DESARROLLO:\n${safeArray(s.actividades_desarrollo).map(a => ' • ' + a).join('\n')}\n\n` +
                       `CIERRE:\n${safeArray(s.actividades_cierre).map(a => ' • ' + a).join('\n')}\n\n` +
                       `RECURSOS: ${safeArray(s.recursos).join(', ')}`,
            }
          ]),
          theme: 'grid',
          headStyles: { fillColor: [51, 65, 85], fontSize: 9 },
          styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 'auto' } }
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      });

      if (currentY > 210) { doc.addPage(); currentY = 20; }
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['EVALUACIÓN FORMATIVA']],
        body: [[
          {
            content: `TÉCNICAS:\n${safeArray(plan.evaluacion_formativa?.tecnicas).map(t => '• ' + t).join('\n')}\n\n` +
                     `INSTRUMENTOS:\n${safeArray(plan.evaluacion_formativa?.instrumentos).map(t => '• ' + t).join('\n')}\n\n` +
                     `CRITERIOS:\n${safeArray(plan.evaluacion_formativa?.criterios_evaluacion).map(t => '• ' + t).join('\n')}`,
            styles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], cellPadding: 8 }
          }
        ]],
        theme: 'plain'
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;

      const bibData = safeArray(plan.bibliografia_especializada);
      if (bibData.length > 0) {
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("BIBLIOGRAFÍA Y REFERENCIAS", margin, currentY);
        currentY += 5;

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [['AUTOR', 'AÑO', 'TÍTULO', 'USO']],
          body: bibData.map(b => [safeStr(b.autor, "Anónimo"), safeStr(b.año, "S/F"), safeStr(b.titulo, "Sin título"), safeStr(b.uso, "Referencia")]),
          theme: 'striped',
          headStyles: { fillColor: [148, 163, 184], fontSize: 8 },
          styles: { fontSize: 8, cellPadding: 3 }
        });
      }

      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`EduPlanAI | Pág. ${i} de ${totalPages}`, margin, doc.internal.pageSize.getHeight() - 10);
      }

      doc.save(`Planeacion_NEM_${plan.titulo_proyecto.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 sm:space-y-16">
      {/* HEADER VISUAL RESPONSIVO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10 pb-10 sm:pb-12 border-b-2 border-slate-100 relative">
        <div className="space-y-4 sm:space-y-6 text-center md:text-left relative z-10 w-full md:w-auto pt-8 md:pt-0">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
            <span className="bg-brand-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-100">
              {plan.metodologia}
            </span>
            <span className="bg-emerald-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100">
              Fase {plan.fase_nem}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tighter">
            {plan.titulo_proyecto}
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 sm:gap-8">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <User className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-black text-slate-800">{plan.nombre_docente}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <School className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-black text-slate-800">{plan.nombre_escuela}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto justify-center md:justify-start">
          <button 
            onClick={exportToPDF}
            disabled={isExporting || isExportingWord}
            className="flex-1 md:flex-none bg-slate-900 hover:bg-brand-600 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-[1.5rem] sm:rounded-[1.8rem] flex flex-col items-center gap-2 transition-all shadow-2xl group active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Download className="w-5 h-5 sm:w-6 sm:h-6 group-hover:bounce" />}
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">PDF</span>
          </button>
          <button 
            onClick={exportToWord}
            disabled={isExporting || isExportingWord}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-[1.5rem] sm:rounded-[1.8rem] flex flex-col items-center gap-2 transition-all shadow-2xl group active:scale-95 disabled:opacity-50"
          >
            {isExportingWord ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <FileText className="w-5 h-5 sm:w-6 sm:h-6 group-hover:bounce" />}
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Word</span>
          </button>
        </div>
      </div>

      {/* CARDS RESUMEN RESPONSIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-indigo-50/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-indigo-100 shadow-sm transition-transform hover:-translate-y-1">
          <Layers className="w-5 h-5 text-indigo-600 mb-4" />
          <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-slate-500">Campos Formativos</h4>
          <div className="flex flex-wrap gap-2">
            {safeArray(plan.campo_formativo).map((c, i) => (
              <span key={i} className="text-[9px] sm:text-[10px] font-black text-indigo-700 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-indigo-100 shadow-sm">{c}</span>
            ))}
          </div>
        </div>
        <div className="bg-emerald-50/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-100 shadow-sm transition-transform hover:-translate-y-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mb-4" />
          <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-slate-500">Ejes Articuladores</h4>
          <div className="flex flex-wrap gap-2">
            {safeArray(plan.ejes_articuladores).map((e, i) => (
              <span key={i} className="text-[9px] sm:text-[10px] font-black text-emerald-700 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-emerald-100 shadow-sm">{e}</span>
            ))}
          </div>
        </div>
        <div className="bg-amber-50/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-amber-100 shadow-sm transition-transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
          <Calendar className="w-5 h-5 text-amber-600 mb-4" />
          <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-slate-500">Propósito</h4>
          <p className="text-xs sm:text-sm font-bold text-amber-800 leading-relaxed italic">"{safeStr(plan.proposito)}"</p>
        </div>
      </div>

      {/* DIAGNÓSTICO RESPONSIVO */}
      <div className="bg-slate-50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-inner">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-5 h-5 text-slate-400" />
          <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Diagnóstico Socioeducativo</h3>
        </div>
        <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">{safeStr(plan.diagnostico_socioeducativo)}</p>
      </div>

      {/* FASES Y SESIONES RESPONSIVO */}
      <div className="space-y-8 sm:space-y-12">
        {safeArray(plan.fases_desarrollo).map((fase, i) => (
          <div key={i} className="bg-white border-2 border-slate-100 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl transition-all">
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-xs sm:text-sm font-black text-brand-600 uppercase tracking-[0.3em]">{safeStr(fase.nombre)}</h4>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2">{safeStr(fase.descripcion)}</p>
            </div>
            <div className="divide-y divide-slate-50">
              {safeArray(fase.sesiones).map((s, si) => (
                <div key={si} className="p-6 sm:p-10 hover:bg-brand-50/10 transition-all">
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div className="lg:w-20 text-center lg:shrink-0">
                      <div className="bg-brand-600 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.8rem] flex flex-col items-center justify-center mx-auto shadow-xl">
                        <span className="text-[8px] sm:text-[10px] font-black opacity-60">S-</span>
                        <span className="text-2xl sm:text-3xl font-black">{s.numero}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6 sm:space-y-8">
                      <h5 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{safeStr(s.titulo)}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div>
                          <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-3">Inicio</span>
                          <ul className="space-y-2">
                            {safeArray(s.actividades_inicio).map((act, ai) => (
                              <li key={ai} className="text-xs font-bold text-slate-600 leading-relaxed">• {act}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] block mb-3">Desarrollo</span>
                          <ul className="space-y-2">
                            {safeArray(s.actividades_desarrollo).map((act, ai) => (
                              <li key={ai} className="text-xs font-black text-slate-800 leading-relaxed">• {act}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[9px] sm:text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block mb-3">Cierre</span>
                          <ul className="space-y-2">
                            {safeArray(s.actividades_cierre).map((act, ai) => (
                              <li key={ai} className="text-xs font-bold text-slate-600 leading-relaxed">• {act}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Recursos necesarios</span>
                        <p className="text-xs font-bold text-slate-500 italic">{safeArray(s.recursos).join(", ")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* EVALUACIÓN FORMATIVA RESPONSIVO */}
      <div className="bg-slate-900 rounded-[2rem] sm:rounded-[3.5rem] p-8 sm:p-16 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-brand-500/10 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 blur-3xl group-hover:bg-brand-500/20 transition-all"></div>
        <div className="flex items-center gap-4 sm:gap-6 mb-10 sm:mb-16 relative z-10">
          <div className="p-3 sm:p-4 bg-brand-500/20 rounded-xl sm:rounded-2xl border border-brand-500/20 shadow-lg shadow-black/20">
            <ClipboardList className="w-6 h-6 sm:w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Evaluación Formativa</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-16 relative z-10">
          <div className="space-y-4 sm:space-y-6">
            <h5 className="text-[10px] sm:text-[11px] font-black text-brand-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4">Técnicas</h5>
            <ul className="space-y-3">
              {safeArray(plan.evaluacion_formativa?.tecnicas).map((t, i) => (
                <li key={i} className="text-sm font-bold text-slate-300 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <h5 className="text-[10px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4">Instrumentos</h5>
            <ul className="space-y-3">
              {safeArray(plan.evaluacion_formativa?.instrumentos).map((t, i) => (
                <li key={i} className="text-sm font-bold text-slate-300 flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1">
            <h5 className="text-[10px] sm:text-[11px] font-black text-amber-400 uppercase tracking-[0.4em] border-b border-white/10 pb-4">Criterios</h5>
            <ul className="space-y-4">
              {safeArray(plan.evaluacion_formativa?.criterios_evaluacion).map((t, i) => (
                <li key={i} className="text-xs sm:text-sm font-black text-white bg-white/5 p-4 rounded-xl sm:rounded-2xl border border-white/5 italic hover:bg-white/10 transition-colors">"{t}"</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BIBLIOGRAFÍA RESPONSIVO */}
      {safeArray(plan.bibliografia_especializada).length > 0 && (
        <div className="pb-16 sm:pb-20 px-2 sm:px-0">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            <h3 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Referencias Especializadas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {plan.bibliografia_especializada.map((bib, i) => (
              <div key={i} className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-400">{safeStr(bib.año, "S/F")}</span>
                </div>
                <div className="min-w-0">
                  <h6 className="text-sm font-bold text-slate-900 truncate">{safeStr(bib.titulo, "Sin título")}</h6>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold truncate">{safeStr(bib.autor, "Anónimo")}</p>
                  <p className="text-[9px] sm:text-[10px] text-brand-600 mt-2 font-black uppercase tracking-[0.1em] line-clamp-2">Uso: {safeStr(bib.uso, "Referencia")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanPreview;
