
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
  FileText,
  Target,
  Search,
  BookOpen,
  MapPin,
  Flame,
  Star,
  Plus,
  Compass,
  Link as LinkIcon
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
  VerticalAlign,
  BorderStyle
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
            // TÍTULO Y ENCABEZADO
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

            // DIAGNÓSTICO
            new Paragraph({ text: "DIAGNÓSTICO SOCIOEDUCATIVO", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            new Paragraph({ text: safeStr(plan.diagnostico_socioeducativo), spacing: { after: 300 } }),

            // ELEMENTOS CURRICULARES
            new Paragraph({ text: "ELEMENTOS CURRICULARES", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CAMPO FORMATIVO", bold: true })] })], shading: { fill: "F1F5F9", type: ShadingType.CLEAR } }),
                    new TableCell({ children: [new Paragraph({ text: safeArray(plan.campo_formativo).join(", ") })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "EJES ARTICULADORES", bold: true })] })], shading: { fill: "F1F5F9", type: ShadingType.CLEAR } }),
                    new TableCell({ children: [new Paragraph({ text: safeArray(plan.ejes_articuladores).join(", ") })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PROPÓSITO", bold: true })] })], shading: { fill: "F1F5F9", type: ShadingType.CLEAR } }),
                    new TableCell({ children: [new Paragraph({ text: safeStr(plan.proposito) })] }),
                  ],
                }),
              ],
            }),

            // VINCULACIÓN PDA
            new Paragraph({ text: "VINCULACIÓN CURRICULAR (CONTENIDOS Y PDA)", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } }),
            ...safeArray(plan.vinculacion_contenido_pda).flatMap(v => [
              new Paragraph({ children: [new TextRun({ text: `Campo/Asignatura: ${v.asignatura}`, bold: true })], spacing: { before: 100 } }),
              new Paragraph({ children: [new TextRun({ text: `Contenido: ${v.contenido}`, italics: true })] }),
              ...safeArray(v.pda_vinculados).map(p => new Paragraph({ text: `• ${p}`, spacing: { left: 400 } })),
            ]),

            // SECUENCIA DIDÁCTICA DETALLADA
            new Paragraph({ text: "PLAN DE ACCIÓN (SECUENCIA DIDÁCTICA)", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
            ...safeArray(plan.fases_desarrollo).flatMap((fase, fIdx) => [
              new Paragraph({ 
                text: `${fIdx + 1}. ${safeStr(fase.nombre).toUpperCase()}`, 
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({ text: safeStr(fase.descripcion), italics: true, spacing: { after: 150 } }),
              ...safeArray(fase.sesiones).map(s => new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ 
                        children: [new Paragraph({ children: [new TextRun({ text: `SESIÓN ${s.numero}: ${s.titulo}`, bold: true, color: "FFFFFF" })] })],
                        shading: { fill: "334155", type: ShadingType.CLEAR },
                        columnSpan: 2
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Inicio", bold: true })] })], width: { size: 25, type: WidthType.PERCENTAGE } }),
                      new TableCell({ children: safeArray(s.actividades_inicio).map(a => new Paragraph({ text: `• ${a}`, spacing: { after: 50 } })) })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Desarrollo", bold: true })] })] }),
                      new TableCell({ children: safeArray(s.actividades_desarrollo).map(a => new Paragraph({ text: `• ${a}`, spacing: { after: 50 } })) })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cierre", bold: true })] })] }),
                      new TableCell({ children: safeArray(s.actividades_cierre).map(a => new Paragraph({ text: `• ${a}`, spacing: { after: 50 } })) })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Recursos y Evaluación", bold: true })] })] }),
                      new TableCell({ 
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Recursos: ", bold: true }), new TextRun({ text: safeArray(s.recursos).join(", ") })] }),
                          new Paragraph({ children: [new TextRun({ text: "Evaluación/Evidencia: ", bold: true }), new TextRun({ text: safeStr(s.evaluacion_sesion) })] })
                        ] 
                      })
                    ]
                  })
                ],
                spacing: { after: 200 }
              }))
            ]),

            // EVALUACIÓN FORMATIVA
            new Paragraph({ text: "EVALUACIÓN FORMATIVA", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
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
                    new TableCell({ children: safeArray(plan.evaluacion_formativa?.criterios_evaluacion).map(c => new Paragraph({ text: `• ${c}` })) }),
                  ],
                }),
              ],
            }),

            // BIBLIOGRAFÍA
            ...(safeArray(plan.bibliografia_especializada).length > 0 ? [
              new Paragraph({ text: "BIBLIOGRAFÍA Y REFERENCIAS", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
              ...safeArray(plan.bibliografia_especializada).map(b => 
                new Paragraph({ 
                  children: [
                    new TextRun({ text: `${safeStr(b.autor)} (${safeStr(b.año)}). `, bold: true }),
                    new TextRun({ text: `"${safeStr(b.titulo)}". `, italics: true }),
                    new TextRun({ text: `Uso: ${safeStr(b.uso)}` })
                  ],
                  spacing: { after: 100 }
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
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
      const primaryColor: [number, number, number] = [79, 70, 229];
      const secondaryColor: [number, number, number] = [30, 41, 59];

      // Encabezado
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const titleLines = doc.splitTextToSize(safeStr(plan.titulo_proyecto).toUpperCase(), contentWidth);
      doc.text(titleLines, margin, 18);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`DOCENTE: ${safeStr(plan.nombre_docente)} | ESCUELA: ${safeStr(plan.nombre_escuela)}`, margin, 35);
      doc.text(`FASE: ${safeStr(plan.fase_nem)} | METODOLOGÍA: ${safeStr(plan.metodologia)}`, margin, 40);

      let currentY = 50;

      // Diagnóstico
      autoTable(doc, {
        startY: currentY,
        head: [['DIAGNÓSTICO SOCIOEDUCATIVO']],
        body: [[safeStr(plan.diagnostico_socioeducativo)]],
        theme: 'plain',
        headStyles: { fontStyle: 'bold', textColor: primaryColor, fontSize: 10, cellPadding: { bottom: 2 } },
        styles: { fontSize: 8.5, cellPadding: 1, overflow: 'linebreak' },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 5;

      // Propósito y Elementos Curriculares
      autoTable(doc, {
        startY: currentY,
        head: [['ELEMENTOS CURRICULARES', 'CONTENIDO']],
        body: [
          ['CAMPOS FORMATIVOS', safeArray(plan.campo_formativo).join(', ')],
          ['EJES ARTICULADORES', safeArray(plan.ejes_articuladores).join(', ')],
          ['PROPÓSITO', safeStr(plan.proposito)]
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold', fillColor: [249, 250, 251] } },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;

      // Vinculación Curricular
      autoTable(doc, {
        startY: currentY,
        head: [['CAMPO / ASIGNATURA', 'CONTENIDO Y PROCESOS DE DESARROLLO (PDA)']],
        body: safeArray(plan.vinculacion_contenido_pda).map(v => [
          v.asignatura,
          `${v.contenido}\n\nPDA:\n${safeArray(v.pda_vinculados).map(p => '• ' + p).join('\n')}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: secondaryColor, fontSize: 9 },
        styles: { fontSize: 8, overflow: 'linebreak', cellPadding: 4 },
        columnStyles: { 0: { cellWidth: 35, fontStyle: 'bold' } },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;

      // Secuencia Didáctica
      safeArray(plan.fases_desarrollo).forEach((fase, fIdx) => {
        if (currentY > 260) { doc.addPage(); currentY = 20; }
        
        autoTable(doc, {
          startY: currentY,
          body: [[{ content: `${fIdx + 1}. ${safeStr(fase.nombre).toUpperCase()}`, styles: { fontStyle: 'bold', fillColor: [238, 242, 255], textColor: primaryColor, fontSize: 10 } }]],
          theme: 'plain',
          margin: { left: margin, right: margin }
        });
        currentY = (doc as any).lastAutoTable.finalY;

        const sessionRows = safeArray(fase.sesiones).map(s => [
          { content: `S${s.numero}\n${s.duracion}`, styles: { halign: 'center', fontStyle: 'bold' } },
          `TÍTULO: ${s.titulo}\n\nINICIO:\n${safeArray(s.actividades_inicio).map(a => '• '+a).join('\n')}\n\nDESARROLLO:\n${safeArray(s.actividades_desarrollo).map(a => '• '+a).join('\n')}\n\nCIERRE:\n${safeArray(s.actividades_cierre).map(a => '• '+a).join('\n')}\n\nRECURSOS: ${safeArray(s.recursos).join(', ')}\nEVIDENCIA: ${s.evaluacion_sesion}`
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['SESIÓN', 'PLAN DE CLASE DETALLADO']],
          body: sessionRows,
          theme: 'grid',
          headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
          styles: { fontSize: 7.5, overflow: 'linebreak', cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 'auto' } },
          margin: { left: margin, right: margin },
          pageBreak: 'auto'
        });
        currentY = (doc as any).lastAutoTable.finalY + 6;
      });

      // Evaluación Formativa
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      autoTable(doc, {
        startY: currentY,
        head: [['EVALUACIÓN FORMATIVA']],
        body: [
          [{ content: `TÉCNICAS: ${safeArray(plan.evaluacion_formativa?.tecnicas).join(', ')}`, styles: { fontStyle: 'bold' } }],
          [{ content: `INSTRUMENTOS: ${safeArray(plan.evaluacion_formativa?.instrumentos).join(', ')}`, styles: { fontStyle: 'bold' } }],
          [`CRITERIOS:\n${safeArray(plan.evaluacion_formativa?.criterios_evaluacion).map(c => '• ' + c).join('\n')}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], fontSize: 10 },
        styles: { fontSize: 8, cellPadding: 4 },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;

      // Bibliografía
      if (safeArray(plan.bibliografia_especializada).length > 0) {
        if (currentY > 250) { doc.addPage(); currentY = 20; }
        autoTable(doc, {
          startY: currentY,
          head: [['ACERVO BIBLIOGRÁFICO']],
          body: safeArray(plan.bibliografia_especializada).map(b => [`${b.autor} (${b.año}). ${b.titulo}. Uso: ${b.uso}`]),
          theme: 'plain',
          headStyles: { textColor: primaryColor, fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 7.5, cellPadding: 1 },
          margin: { left: margin, right: margin }
        });
      }

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado por EduPlanAI | Página ${i} de ${totalPages}`, margin, doc.internal.pageSize.getHeight() - 10);
      }

      doc.save(`EduPlanAI_${plan.titulo_proyecto.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  return (
    <div className="space-y-12 sm:space-y-20">
      {/* Top Actions & Header Card */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 sm:p-12 border border-white/80 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap gap-2.5">
              <span className="bg-brand-600/10 text-brand-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-brand-200/50">
                {plan.metodologia}
              </span>
              <span className="bg-emerald-600/10 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-200/50">
                FASE {plan.fase_nem}
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-6xl font-display font-black text-slate-900 leading-[1.1] tracking-tight">
              {plan.titulo_proyecto}
            </h2>
            
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Docente</p>
                  <p className="text-sm font-black text-slate-800">{plan.nombre_docente}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <School className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institución</p>
                  <p className="text-sm font-black text-slate-800">{plan.nombre_escuela}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zona/CCT</p>
                  <p className="text-sm font-black text-slate-800">{plan.zona_escolar || 'N/A'} • {plan.cct || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3 shrink-0 self-end md:self-auto">
            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-slate-900 hover:bg-brand-600 text-white px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl group hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">PDF</span>
            </button>
            <button 
              onClick={exportToWord}
              disabled={isExportingWord}
              className="bg-white hover:bg-indigo-50 text-brand-600 px-8 py-5 rounded-2xl flex items-center justify-center gap-3 border border-brand-100 transition-all shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {isExportingWord ? <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> : <FileText className="w-5 h-5" />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Word</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Context & Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-brand-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em]">Propósito Pedagógico</h3>
            </div>
            <p className="text-xl sm:text-2xl font-display font-medium leading-relaxed italic opacity-95">
              "{safeStr(plan.proposito)}"
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-[2.5rem] p-10 border border-white/80 shadow-premium">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-500" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Diagnóstico del Entorno</h3>
            </div>
            <p className="text-slate-600 text-lg font-medium leading-relaxed whitespace-pre-wrap">
              {safeStr(plan.diagnostico_socioeducativo)}
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/80 rounded-[2.5rem] p-8 border border-white/80 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-5 h-5 text-indigo-500" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Campos Formativos</h4>
            </div>
            <div className="flex flex-col gap-3">
              {safeArray(plan.campo_formativo).map((c, i) => (
                <div key={i} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-indigo-500"></div>
                  <span className="text-xs font-black text-indigo-800">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 rounded-[2.5rem] p-8 border border-white/80 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ejes Articuladores</h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {safeArray(plan.ejes_articuladores).map((e, i) => (
                <span key={i} className="text-[9px] font-black text-emerald-700 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-100/50">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vinculación Curricular */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 px-4 flex items-center gap-3">
            <Compass className="w-4 h-4 text-brand-600" /> Vinculación Curricular
          </h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safeArray(plan.vinculacion_contenido_pda).map((item, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-premium flex flex-col space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.asignatura}</p>
                  <h5 className="text-xl font-display font-black text-slate-900 leading-tight">{item.contenido}</h5>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">PDA Vinculados</span>
                </div>
                <div className="space-y-3">
                  {safeArray(item.pda_vinculados).map((pda, pIdx) => (
                    <div key={pIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[13px] font-medium text-slate-600 leading-relaxed">
                      {pda}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planeación de Fases */}
      <div className="space-y-16">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200"></div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 px-4 flex items-center gap-3">
            <Flame className="w-4 h-4 text-brand-600" /> Secuencia Didáctica
          </h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        {safeArray(plan.fases_desarrollo).map((fase, i) => (
          <div key={i} className="group">
            <div className="mb-8 flex items-baseline gap-4">
              <span className="text-5xl font-display font-black text-brand-500 opacity-20">0{i+1}</span>
              <div>
                <h4 className="text-2xl font-display font-black text-slate-900 tracking-tight">{safeStr(fase.nombre)}</h4>
                <p className="text-sm font-bold text-slate-400 mt-1">{safeStr(fase.descripcion)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {safeArray(fase.sesiones).map((s, si) => (
                <div key={si} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-500 overflow-hidden">
                  <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-50">
                    <div className="p-8 xl:w-64 shrink-0 bg-slate-50/50 flex xl:flex-col items-center justify-between xl:justify-center text-center gap-4">
                      <div className="bg-white w-20 h-20 rounded-3xl flex flex-col items-center justify-center shadow-premium border border-slate-100">
                        <span className="text-[10px] font-black text-brand-500 opacity-50 mb-1">SESIÓN</span>
                        <span className="text-3xl font-black text-slate-900">{s.numero}</span>
                      </div>
                      <div className="text-left xl:text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duración</p>
                        <div className="flex items-center gap-2 justify-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-brand-600" />
                          <span className="text-xs font-black text-slate-700">{safeStr(s.duracion)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-8 sm:p-10 space-y-10">
                      <h5 className="text-2xl font-display font-bold text-slate-900 leading-tight">{safeStr(s.titulo)}</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-4 bg-brand-500 rounded-full"></div>
                            <h6 className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Apertura</h6>
                          </div>
                          <ul className="space-y-3">
                            {safeArray(s.actividades_inicio).map((act, ai) => (
                              <li key={ai} className="text-[13px] font-medium text-slate-600 leading-relaxed flex gap-3">
                                <span className="text-brand-300 font-black shrink-0">•</span> {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                            <h6 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Desarrollo</h6>
                          </div>
                          <ul className="space-y-3">
                            {safeArray(s.actividades_desarrollo).map((act, ai) => (
                              <li key={ai} className="text-[13px] font-bold text-slate-800 leading-relaxed flex gap-3">
                                <Plus className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                            <h6 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Cierre</h6>
                          </div>
                          <ul className="space-y-3">
                            {safeArray(s.actividades_cierre).map((act, ai) => (
                              <li key={ai} className="text-[13px] font-medium text-slate-600 leading-relaxed flex gap-3">
                                <span className="text-amber-400 font-black shrink-0">•</span> {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-50 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                          <Briefcase size={14} className="text-slate-400" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recursos:</span>
                          <p className="text-[11px] font-bold text-slate-500 italic">{safeArray(s.recursos).join(", ")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Star size={14} className="text-brand-400" />
                          <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Logro:</span>
                          <p className="text-[11px] font-bold text-slate-600">{safeStr(s.evaluacion_sesion)}</p>
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

      {/* Evaluación Formativa Section */}
      <div className="bg-slate-950 rounded-[4rem] p-10 sm:p-20 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full -mr-250 -mt-250 blur-[120px] group-hover:bg-brand-600/20 transition-all duration-1000"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20 relative z-10">
          <div>
            <h3 className="text-4xl sm:text-5xl font-display font-black tracking-tight mb-4">Métricas de Valoración</h3>
            <p className="text-brand-200/60 font-medium max-w-lg">Evaluación continua y formativa diseñada para movilizar saberes y retroalimentar el proceso de aprendizaje.</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl shrink-0 flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-500 rounded-3xl flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">Tipo</p>
              <p className="text-lg font-black">Formativa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          <div className="space-y-8">
            <h5 className="text-[12px] font-black text-brand-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-400"></div> Técnicas
            </h5>
            <div className="space-y-4">
              {safeArray(plan.evaluacion_formativa?.tecnicas).map((t, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                    <span className="text-[10px] font-black">{i+1}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <h5 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Instrumentos
            </h5>
            <div className="space-y-4">
              {safeArray(plan.evaluacion_formativa?.instrumentos).map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-default">
                   <p className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                     <CheckCircle2 size={14} className="text-emerald-500" /> {t}
                   </p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <h5 className="text-[12px] font-black text-amber-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div> Criterios
            </h5>
            <div className="space-y-6">
              {safeArray(plan.evaluacion_formativa?.criterios_evaluacion).map((t, i) => (
                <div key={i} className="relative pl-6">
                   <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500 to-transparent"></div>
                   <p className="text-sm font-black italic text-slate-100 leading-relaxed">"{t}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Referencias Footer */}
      {safeArray(plan.bibliografia_especializada).length > 0 && (
        <div className="bg-white/40 rounded-[3rem] p-12 border border-white/80">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-slate-100 rounded-2xl">
              <BookMarked className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Acervo Bibliográfico</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Fuentes y recursos consultados para el codiseño.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plan.bibliografia_especializada.map((bib, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-50 shadow-sm flex items-start gap-6 hover:shadow-premium transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-brand-50 transition-colors">
                  <span className="text-xs font-black text-slate-400 group-hover:text-brand-600 transition-colors">{safeStr(bib.año, "S/F")}</span>
                </div>
                <div>
                  <h6 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">{safeStr(bib.titulo)}</h6>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-black">{safeStr(bib.autor)}</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-lg text-brand-600">
                    <span className="text-[9px] font-black uppercase tracking-widest">Uso: {safeStr(bib.uso)}</span>
                  </div>
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
