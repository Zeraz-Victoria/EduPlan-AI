
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
      Diseña una "Planeación de Codiseño (Plano Didáctico)" de excelencia técnica y pedagógica.
      Debes ser extremadamente preciso con la vinculación de contenidos y PDA.
      Responde EXCLUSIVAMENTE con el objeto JSON solicitado, respetando estrictamente los nombres de las propiedades.
    `;

    const prompt = `
      Genera una planeación didáctica completa con los siguientes datos:
      - Grado: ${params.grado}
      - Fase: ${params.fase}
      - Metodología: ${params.metodologia}
      - Número de Sesiones: ${params.numSesiones}
      - Problemática/Contexto: ${params.contextoAdicional || 'General'}
      - Escuela: ${params.nombreEscuela}
      - Docente: ${params.nombreDocente}

      ESTRUCTURA JSON OBLIGATORIA (Usa exactamente estas llaves):
      {
        "titulo_proyecto": "Título creativo",
        "nombre_docente": "${params.nombreDocente}",
        "nombre_escuela": "${params.nombreEscuela}",
        "cct": "${params.cct || ''}",
        "zona_escolar": "${params.zonaEscolar || ''}",
        "grado": "${params.grado}",
        "fase_nem": "${params.fase}",
        "metodologia": "${params.metodologia}",
        "campo_formativo": ["Campo 1", "Campo 2"],
        "ejes_articuladores": ["Eje 1", "Eje 2"],
        "proposito": "Propósito general del proyecto",
        "diagnostico_socioeducativo": "Análisis del contexto",
        "temporalidad_realista": "Duración estimada",
        "vinculacion_contenido_pda": [{ "asignatura": "...", "contenido": "...", "pda_vinculados": ["..."] }],
        "fases_desarrollo": [
          { 
            "nombre": "Nombre de la Fase", 
            "descripcion": "Descripción breve", 
            "sesiones": [
              { 
                "numero": 1, 
                "titulo": "Título Sesión", 
                "duracion": "50 min", 
                "actividades_inicio": ["..."], 
                "actividades_desarrollo": ["..."], 
                "actividades_cierre": ["..."], 
                "recursos": ["..."], 
                "evaluacion_sesion": "..." 
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
          { "autor": "Nombre Autor", "titulo": "Título Libro/Art", "año": "2024", "uso": "Para qué sirve en el proyecto" }
        ]
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
    const parsed = JSON.parse(cleanJson);

    // Validación mínima para evitar undefineds comunes
    if (parsed.bibliografia_especializada) {
      parsed.bibliografia_especializada = parsed.bibliografia_especializada.map((b: any) => ({
        autor: b.autor || b.author || "Anónimo",
        titulo: b.titulo || b.title || "Sin título",
        año: b.año || b.year || "S/F",
        uso: b.uso || b.use || "Referencia general"
      }));
    }

    return parsed as LessonPlan;

  } catch (error: any) {
    console.error("Detalle técnico del error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("LA API KEY ES INCORRECTA: La clave no es válida.");
    }
    if (error.message?.includes("429")) {
      throw new Error("CUOTA EXCEDIDA: Espera 60 segundos.");
    }
    throw new Error(`ERROR DE GENERACIÓN: ${error.message.substring(0, 100)}`);
  }
};
