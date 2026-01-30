
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
    4. TEMPORALIDAD: Desarrolla ${params.numSesiones} sesiones.

    REGLAS TÉCNICAS:
    - Responde ÚNICAMENTE con JSON.
  `;

  const prompt = `
    DISEÑA EL PLANO DIDÁCTICO COMPLETO:
    - Problemática: ${params.contextoAdicional || 'Situación de aprendizaje'}
    - Grado: ${params.grado} | Fase: ${params.fase}
    - Metodología: ${params.metodologia}
    - Sesiones: ${params.numSesiones}
    - Docente: ${params.nombreDocente}
    - Escuela: ${params.nombreEscuela}
    - CCT: ${params.cct || 'N/A'}
    - Zona: ${params.zonaEscolar || 'N/A'}

    Estructura JSON:
    {
      "titulo_proyecto": "Título corto",
      "nombre_docente": "...",
      "nombre_escuela": "...",
      "cct": "...",
      "zona_escolar": "...",
      "grado": "...",
      "fase_nem": "...",
      "metodologia": "...",
      "campo_formativo": ["..."],
      "ejes_articuladores": ["..."],
      "proposito": "...",
      "diagnostico_socioeducativo": "...",
      "temporalidad_realista": "...",
      "vinculacion_contenido_pda": [{ "asignatura": "...", "contenido": "...", "pda_vinculados": ["..."] }],
      "fases_desarrollo": [{ "nombre": "...", "descripcion": "...", "sesiones": [{ "numero": 1, "titulo": "...", "duracion": "...", "actividades_inicio": ["..."], "actividades_desarrollo": ["..."], "actividades_cierre": ["..."], "recursos": ["..."], "evaluacion_sesion": "..." }] }],
      "evaluacion_formativa": { "tecnicas": ["..."], "instrumentos": ["..."], "criterios_evaluacion": ["..."] },
      "bibliografia_especializada": [{ "autor": "...", "titulo": "...", "año": "2023", "uso": "Sustento" }]
    }
  `;

  try {
    const parts: any[] = [{ text: prompt }];
    if (params.pdfBase64) {
      parts.push({ inlineData: { mimeType: "application/pdf", data: params.pdfBase64 } });
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { 
        systemInstruction, 
        responseMimeType: "application/json",
        temperature: 0.3,
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
    
    // Manejo específico de cuota excedida (Error 429)
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("LÍMITE DE CUOTA EXCEDIDO: Has realizado demasiadas peticiones en poco tiempo. Por favor, espera 1 o 2 minutos antes de intentar generar una nueva planeación.");
    }
    
    // Otros errores
    throw new Error("Error en la comunicación con la IA. Por favor, verifica tu conexión o intenta con un contexto más breve.");
  }
};
