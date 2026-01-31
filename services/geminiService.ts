
import { GoogleGenAI } from "@google/genai";
import { LessonPlan, PlanningRequest } from "../types.ts";

export const generateLessonPlanStream = async (
  params: PlanningRequest,
  onChunk: (text: string) => void
): Promise<LessonPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Eres un Doctor en Pedagogía y Especialista en el Plan de Estudio 2022 (NEM, México).
    Tu misión es diseñar una "Planeación de Codiseño (Plano Didáctico)" de excelencia.

    CRITERIOS DE TÍTULO:
    - El título debe ser CORTO (máximo 5-6 palabras), IMPACTANTE y CREATIVO.
    - Adaptado al grado escolar del alumno.

    CRITERIOS PEDAGÓGICOS:
    1. BÚSQUEDA EXHAUSTIVA DE CONTENIDOS: Vinculación MULTIDISCIPLINARIA real de los 4 Campos Formativos.
    2. ELEMENTOS OFICIALES: Título, Propósito, Campos, Ejes, Contenidos, PDAs, Metodología, Fases, Actividades Detalladas, Evaluación Formativa y Recursos.
    3. METODOLOGÍA: Sigue las fases de: ${params.metodologia}.
    4. TEMPORALIDAD: Desarrolla ${params.numSesiones} sesiones completas.
    5. CONTEXTO: Utiliza obligatoriamente la problemática proporcionada para situar el aprendizaje.

    REGLAS TÉCNICAS:
    - Responde ÚNICAMENTE con JSON válido según el esquema solicitado.
  `;

  const prompt = `
    DISEÑA EL PLANO DIDÁCTICO COMPLETO:
    - Problemática Situacional: ${params.contextoAdicional || 'Situación de aprendizaje general'}
    - Grado: ${params.grado} | Fase: ${params.fase}
    - Metodología: ${params.metodologia}
    - Número de Sesiones: ${params.numSesiones}
    - Docente: ${params.nombreDocente}
    - Escuela: ${params.nombreEscuela}
    - CCT: ${params.cct || 'N/A'}
    - Zona: ${params.zonaEscolar || 'N/A'}

    Estructura JSON requerida:
    {
      "titulo_proyecto": "Título corto e impactante",
      "nombre_docente": "...",
      "nombre_escuela": "...",
      "cct": "...",
      "zona_escolar": "...",
      "grado": "...",
      "fase_nem": "...",
      "metodologia": "...",
      "campo_formativo": ["Campo 1", "Campo 2"],
      "ejes_articuladores": ["Eje 1", "Eje 2"],
      "proposito": "Propósito pedagógico claro",
      "diagnostico_socioeducativo": "Resumen situacional basado en la problemática",
      "temporalidad_realista": "Estimación de tiempo",
      "vinculacion_contenido_pda": [{ "asignatura": "...", "contenido": "...", "pda_vinculados": ["..."] }],
      "fases_desarrollo": [{ "nombre": "Nombre de la Fase", "descripcion": "...", "sesiones": [{ "numero": 1, "titulo": "...", "duracion": "50 min", "actividades_inicio": ["..."], "actividades_desarrollo": ["..."], "actividades_cierre": ["..."], "recursos": ["..."], "evaluacion_sesion": "..." }] }],
      "evaluacion_formativa": { "tecnicas": ["..."], "instrumentos": ["..."], "criterios_evaluacion": ["..."] },
      "bibliografia_especializada": [{ "autor": "SEP", "titulo": "Plan de Estudio 2022", "año": "2022", "uso": "Marco Normativo" }]
    }
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        systemInstruction, 
        responseMimeType: "application/json",
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 32000 }
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      fullText += chunk.text;
      onChunk(fullText);
    }

    const firstBrace = fullText.indexOf('{');
    const lastBrace = fullText.lastIndexOf('}');
    const cleanJson = fullText.substring(firstBrace, lastBrace + 1).replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
    return JSON.parse(cleanJson) as LessonPlan;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("LÍMITE DE CUOTA: Por favor espera un minuto para volver a generar.");
    }
    throw new Error("Error al generar la planeación. Intenta con un contexto más sencillo.");
  }
};
