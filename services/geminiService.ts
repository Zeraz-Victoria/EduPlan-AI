
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
      Tu tarea es diseñar un "Plano Didáctico" de excelencia.
      REQUISITO CRÍTICO: Debes incluir CONTENIDOS y PDA (Procesos de Desarrollo de Aprendizaje) REALES y VIGENTES de los Programas Sintéticos de la SEP para la ${params.fase} y el grado ${params.grado}.
      No inventes los PDA; deben ser coherentes con la estructura curricular oficial.
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

      INSTRUCCIONES PARA VINCULACIÓN CURRICULAR:
      En la propiedad "vinculacion_contenido_pda", selecciona al menos 2 contenidos y sus respectivos PDA que se relacionen directamente con la problemática planteada y la metodología seleccionada. Asegúrate de que los PDA sean observables y evaluables.

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
        "campo_formativo": ["Indica los campos formativos involucrados"],
        "ejes_articuladores": ["Indica los ejes articuladores que se movilizan"],
        "proposito": "Propósito general del proyecto de acuerdo a la NEM",
        "diagnostico_socioeducativo": "Análisis basado en el contexto proporcionado",
        "temporalidad_realista": "Ej. 2 semanas / ${params.numSesiones} sesiones",
        "vinculacion_contenido_pda": [
          { 
            "asignatura": "Asignatura/Disciplina vinculada", 
            "contenido": "Nombre del contenido del programa sintético", 
            "pda_vinculados": ["PDA 1 del programa", "PDA 2 del programa"] 
          }
        ],
        "fases_desarrollo": [
          { 
            "nombre": "Nombre de la fase según la metodología", 
            "descripcion": "Enfoque de esta etapa", 
            "sesiones": [
              { 
                "numero": 1, 
                "titulo": "Título de la sesión", 
                "duracion": "50-60 min", 
                "actividades_inicio": ["Actividades de enganche/recuperación"], 
                "actividades_desarrollo": ["Actividades de construcción/acción"], 
                "actividades_cierre": ["Actividades de síntesis/evaluación"], 
                "recursos": ["Materiales específicos"], 
                "evaluacion_sesion": "Criterio de éxito de la sesión" 
              }
            ] 
          }
        ],
        "evaluacion_formativa": { 
          "tecnicas": ["Técnica 1", "Técnica 2"], 
          "instrumentos": ["Instrumento 1", "Instrumento 2"], 
          "criterios_evaluacion": ["Criterio 1", "Criterio 2"] 
        },
        "bibliografia_especializada": [
          { "autor": "Nombre Autor", "titulo": "Título Obra", "año": "2024", "uso": "Justificación de uso" }
        ]
      }
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        systemInstruction, 
        responseMimeType: "application/json",
        temperature: 0.2
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
