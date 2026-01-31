
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
      Eres un Doctor en Pedagogía y Especialista en el Plan de Estudio 2022 (NEM, México).
      Diseña una "Planeación de Codiseño (Plano Didáctico)" de excelencia técnica.
      Responde EXCLUSIVAMENTE con el objeto JSON solicitado.
    `;

    const prompt = `
      Genera una planeación para:
      - Grado: ${params.grado} | Fase: ${params.fase}
      - Metodología: ${params.metodologia}
      - Sesiones: ${params.numSesiones}
      - Problemática: ${params.contextoAdicional || 'General'}
      - Escuela: ${params.nombreEscuela}
      - Docente: ${params.nombreDocente}

      Formato JSON esperado:
      {
        "titulo_proyecto": "Título creativo corto",
        "nombre_docente": "${params.nombreDocente}",
        "nombre_escuela": "${params.nombreEscuela}",
        "cct": "${params.cct || ''}",
        "zona_escolar": "${params.zonaEscolar || ''}",
        "grado": "${params.grado}",
        "fase_nem": "${params.fase}",
        "metodologia": "${params.metodologia}",
        "campo_formativo": [],
        "ejes_articuladores": [],
        "proposito": "...",
        "diagnostico_socioeducativo": "...",
        "temporalidad_realista": "...",
        "vinculacion_contenido_pda": [{ "asignatura": "...", "contenido": "...", "pda_vinculados": [] }],
        "fases_desarrollo": [{ "nombre": "...", "descripcion": "...", "sesiones": [{ "numero": 1, "titulo": "...", "duracion": "...", "actividades_inicio": [], "actividades_desarrollo": [], "actividades_cierre": [], "recursos": [], "evaluacion_sesion": "..." }] }],
        "evaluacion_formativa": { "tecnicas": [], "instrumentos": [], "criterios_evaluacion": [] },
        "bibliografia_especializada": []
      }
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        systemInstruction, 
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const fullText = result.text || "";
    const firstBrace = fullText.indexOf('{');
    const lastBrace = fullText.lastIndexOf('}');
    
    if (firstBrace === -1) throw new Error("La IA no generó un formato compatible.");
    
    const cleanJson = fullText.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleanJson) as LessonPlan;

  } catch (error: any) {
    console.error("Detalle técnico del error:", error);
    
    // Traducción de errores técnicos de Google a mensajes para el usuario
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("LA API KEY ES INCORRECTA: La clave copiada de AI Studio no es válida.");
    }
    if (error.message?.includes("429") || error.message?.includes("QUOTA")) {
      throw new Error("CUOTA EXCEDIDA: Has hecho demasiadas peticiones. Espera 60 segundos.");
    }
    if (error.message?.includes("location not supported")) {
      throw new Error("REGIÓN NO SOPORTADA: Google no permite el uso de esta API en tu ubicación actual sin VPN.");
    }
    
    throw new Error(`ERROR DE GENERACIÓN: ${error.message.substring(0, 100)}`);
  }
};
