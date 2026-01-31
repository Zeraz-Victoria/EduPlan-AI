
import { GoogleGenAI } from "@google/genai";
import { LessonPlan, PlanningRequest } from "../types";

export const generateLessonPlanStream = async (
  params: PlanningRequest,
  onChunk: (text: string) => void
): Promise<LessonPlan> => {
  // Verificación estricta de la API KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("CONFIGURACIÓN REQUERIDA: No se detectó una API_KEY válida en Render. Por favor, revisa la pestaña 'Environment' de tu servicio.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      Eres un Doctor en Pedagogía y Especialista de alto nivel en el Plan de Estudio 2022 de la Nueva Escuela Mexicana (NEM).
      Tu tarea es diseñar un "Plano Didáctico" de excelencia con un enfoque INTEGRAL e INTERDISCIPLINARIO.
      
      REQUISITO CRÍTICO CURRICULAR: Debes realizar un mapeo exhaustivo de los Programas Sintéticos de la SEP para la ${params.fase} y el grado ${params.grado}. 
      Busca la máxima vinculación posible: selecciona TODOS los contenidos y sus respectivos PDA que tengan una relación lógica, directa o transversal con la problemática o contexto proporcionado. No te limites a un número mínimo; el objetivo es abordar la problemática desde tantas aristas curriculares como sea pedagógicamente viable.
      
      No inventes los contenidos ni los PDA; deben ser los oficiales.
      Responde EXCLUSIVAMENTE con el objeto JSON solicitado.
    `;

    const prompt = `
      Genera una planeación didáctica profesional con los siguientes datos:
      - Grado: ${params.grado}
      - Fase: ${params.fase}
      - Metodología: ${params.metodologia}
      - Número de Sesiones: ${params.numSesiones}
      - Problemática/Contexto: ${params.contextoAdicional || 'General'}
      - Escuela: ${params.nombreEscuela}
      - Docente: ${params.nombreDocente}

      INSTRUCCIONES PARA VINCULACIÓN CURRICULAR MAXIMIZADA:
      En la propiedad "vinculacion_contenido_pda", identifica e incluye la MAYOR CANTIDAD de contenidos y PDA de los diferentes campos formativos que puedan abordarse simultáneamente con la problemática planteada. 
      Fomenta la interdisciplinariedad (ej. vincular Lenguajes con Ética, Naturaleza y Sociedades si la problemática lo permite).
      Cada par contenido-PDA debe ser pertinente y contribuir directamente a la resolución o análisis de la situación problema.

      ESTRUCTURA JSON OBLIGATORIA:
      {
        "titulo_proyecto": "Título creativo y pedagógico",
        "nombre_docente": "${params.nombreDocente}",
        "nombre_escuela": "${params.nombreEscuela}",
        "cct": "${params.cct || ''}",
        "zona_escolar": "${params.zonaEscolar || ''}",
        "grado": "${params.grado}",
        "fase_nem": "${params.fase}",
        "metodologia": "${params.metodologia}",
        "campo_formativo": ["Lista de todos los campos involucrados"],
        "ejes_articuladores": ["Lista de todos los ejes que se movilizan"],
        "proposito": "Propósito general del proyecto de acuerdo a la NEM",
        "diagnostico_socioeducativo": "Análisis profundo basado en el contexto",
        "temporalidad_realista": "Ej. 2 semanas / ${params.numSesiones} sesiones",
        "vinculacion_contenido_pda": [
          { 
            "asignatura": "Nombre del Campo Formativo o Disciplina", 
            "contenido": "Nombre completo del contenido del programa sintético", 
            "pda_vinculados": ["PDA 1 oficial", "PDA 2 oficial", "... todos los que apliquen"] 
          }
        ],
        "fases_desarrollo": [
          { 
            "nombre": "Nombre de la fase", 
            "descripcion": "Enfoque", 
            "sesiones": [
              { 
                "numero": 1, 
                "titulo": "Título de sesión", 
                "duracion": "50-60 min", 
                "actividades_inicio": ["..."], 
                "actividades_desarrollo": ["..."], 
                "actividades_cierre": ["..."], 
                "recursos": ["..."], 
                "evaluacion_sesion": "Criterio" 
              }
            ] 
          }
        ],
        "evaluacion_formativa": { 
          "tecnicas": ["..."], 
          "instrumentos": ["..."], 
          "criterios_evaluacion": ["..."] 
        },
        "bibliografia_especializada": [
          { "autor": "...", "titulo": "...", "año": "...", "uso": "..." }
        ]
      }
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        systemInstruction, 
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const fullText = result.text || "";
    const firstBrace = fullText.indexOf('{');
    const lastBrace = fullText.lastIndexOf('}');
    
    if (firstBrace === -1) throw new Error("La IA no generó un formato compatible.");
    
    const cleanJson = fullText.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(cleanJson);

    return parsed as LessonPlan;

  } catch (error: any) {
    console.error("Detalle técnico del error:", error);
    throw new Error(`ERROR DE GENERACIÓN: ${error.message.substring(0, 100)}`);
  }
};
