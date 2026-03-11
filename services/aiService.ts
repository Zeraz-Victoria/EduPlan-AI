
import OpenAI from "openai";
import { LessonPlan, PlanningRequest, SecuenciaDidactica } from "../types";
import { EJES_ARTICULADORES_NEM } from "../constants";

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: (import.meta as any).env.VITE_DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage in Vite
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Maximum sessions per batch — keeps response well within 8K token limit
const MAX_SESSIONS_PER_BATCH = 8;

// ─── System instruction shared by all calls ──────────────────────────────────
const buildSystemInstruction = (numSesiones: number) => `
# PERFIL: DOCTOR EN PEDAGOGÍA Y ESPECIALISTA DE ÉLITE NEM 2022
Tu misión es transformar cualquier rezago académico en un proyecto de impacto social.

# 1. FILOSOFÍA PEDAGÓGICA (EL ESTÁNDAR DE EXCELENCIA):
- DIAGNÓSTICO SOCIOCRÍTICO: Conecta siempre la falla técnica con una limitación en la participación social o bienestar del alumno.
- ANDAMIAJE DOCENTE: Cada sesión debe detallar el "Modelaje Docente" (proceso paso a paso que el maestro demuestra en el pizarrón) y la "Acción del Alumno" en el Desarrollo.
- VINCULACIÓN INTERDISCIPLINARIA: Cruza el campo formativo base con contenidos de otros campos ("vinculacion") para resolver el problema de forma integral.
- EVALUACIÓN FORMATIVA: Diseña procesos con criterios de éxito claros y medibles.

# 2. ADAPTABILIDAD METODOLÓGICA TOTAL:
Estructura la secuencia estrictamente según la metodología:
- ABP (6 momentos): Presentemos, Recolectemos, Formulemos el problema, Organicemos la experiencia, Vivamos la experiencia, Resultados y análisis.
- STEAM (5 fases): Introducción, Diseño de investigación, Organizar y responder, Presentar resultados, Metacognición.
- Proyectos Comunitarios (3 fases): Planeación, Acción, Intervención.
- Aprendizaje Servicio (5 etapas): Punto de partida, Lo que sé y lo que quiero saber, Organicemos las actividades, Creatividad en marcha, Compartimos y evaluamos.

# 3. REGLAS TÉCNICAS CRÍTICAS (OBLIGATORIAS — INCUMPLIRLAS ES UN ERROR GRAVE):
- Respuesta: SOLO JSON.
- Volumen: EXACTAMENTE ${numSesiones} sesiones detalladas. No resumas.
- Contenidos: No inventes Contenidos ni PDA; usa los oficiales del programa sintético.
- Tono: Profesional, empoderador y pedagógicamente riguroso.

# 4. REGLA ABSOLUTA — EJES ARTICULADORES:
Los ejes articuladores del campo "ejes_articuladores" en el JSON de respuesta DEBEN ser
EXCLUSIVAMENTE una selección (entre 1 y 4) de los siguientes 7 ejes oficiales del
Programa Sintético NEM 2022. ESTÁ ESTRICTAMENTE PROHIBIDO inventar, parafrasear,
abreviar o modificar estos nombres:
${EJES_ARTICULADORES_NEM.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}

Elige solo los ejes que sean PERTINENTES al diagnóstico y campo formativo del proyecto.
NUNCA uses valores diferentes a los de esta lista.
`;

// ─── Single-call API request with retry logic ────────────────────────────────
const callDeepSeek = async (
  systemPrompt: string,
  userPrompt: string,
  retries = 3
): Promise<any> => {
  try {
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 8192
    });

    const finishReason = response.choices[0].finish_reason;
    if (finishReason === "length") {
      throw new Error(
        "RESPUESTA_TRUNCADA"
      );
    }

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No se recibió contenido de DeepSeek.");

    return JSON.parse(content);
  } catch (error: any) {
    console.error("Error en AI Service:", error);

    // Automatic retry for overload (503) or rate limits (429)
    if (retries > 0 && (error.status === 503 || error.status === 429 || error.message?.includes("overload"))) {
      console.log(`Reintentando... (${retries} intentos restantes)`);
      await sleep(2000);
      return callDeepSeek(systemPrompt, userPrompt, retries - 1);
    }

    // If it was a truncation error, re-throw with a clear message
    if (error.message === "RESPUESTA_TRUNCADA") {
      throw error;
    }

    throw new Error(`ERROR DE GENERACIÓN (DEEPSEEK): ${error.message?.substring(0, 100)}`);
  }
};

// ─── Build the user prompt for the FIRST batch (full structure + first N sessions) ─
const buildFirstBatchPrompt = (params: PlanningRequest, sessionsInBatch: number) => `
### SOLICITUD DE PLANO DIDÁCTICO INTEGRAL (NEM 2022)
Genera un proyecto de impacto social en formato JSON para:
- Grado/Fase: ${params.grado} / ${params.fase}
- Metodología: ${params.metodologia}
- Número TOTAL de Sesiones del proyecto: ${params.numSesiones}
- GENERA AHORA las sesiones 1 a ${sessionsInBatch} (de ${params.numSesiones} totales)
- Problemática/Contexto: ${params.contextoAdicional || 'General'}
- Escuela: ${params.nombreEscuela} | Docente: ${params.nombreDocente}

### ⚠️ EJES ARTICULADORES VÁLIDOS (LISTA CERRADA — NO USES OTROS):
Para el campo "ejes_articuladores" del JSON, SOLO puedes usar valores de esta lista exacta:
${EJES_ARTICULADORES_NEM.map((e, i) => `${i + 1}. "${e}"`).join('\n')}
Elige entre 1 y 4 ejes que sean pertinentes al diagnóstico. No modifiques ni inventes otros.

### ESTRUCTURA JSON REQUERIDA (Respetar estrictamente para compatibilidad de sistema):
{
  "encabezado": { "proyecto": "...", "docente": "...", "escuela": "...", "grado": "...", "fase": "...", "metodologia": "...", "num_sesiones": ${params.numSesiones} },
  "diagnostico_pedagogico": "Análisis sociocrítico conectando la falla técnica con la limitación social",
  "estructura_curricular": {
    "campos_formativos": ["..."],
    "ejes_articuladores": ["..."],
    "proposito": "...",
    "vinculacion": [ { "campo": "...", "contenido": "...", "pdas": ["..."] } ]
  },
  "secuencia_didactica": [
    { 
      "fase_nombre": "Fase Oficial según Metodología", 
      "sesiones": [
        {
          "numero": 1,
          "titulo": "...",
          "duracion": "60 min",
          "inicio": ["..."],
          "desarrollo": ["Modelaje Docente: [Detalle del andamiaje]", "Acción del Alumno: [Detalle]", "..."],
          "cierre": ["..."],
          "recursos": ["..."],
          "evidencia": "..."
        }
      ]
    }
  ],
  "evaluacion_formativa": { "tecnica": "...", "instrumento": "...", "evidencia_proceso": "...", "criterios": ["..."] }
}
`;

// ─── Build the user prompt for CONTINUATION batches (sessions only) ──────────
const buildContinuationPrompt = (
  params: PlanningRequest,
  startSession: number,
  endSession: number,
  projectTitle: string,
  methodology: string,
  previousPhases: string[]
) => `
### CONTINUACIÓN DE PROYECTO: "${projectTitle}"
Estás continuando la generación de sesiones para un proyecto que ya tiene las sesiones 1 a ${startSession - 1} generadas.

CONTEXTO DEL PROYECTO:
- Grado/Fase: ${params.grado} / ${params.fase}
- Metodología: ${methodology}
- Problemática/Contexto: ${params.contextoAdicional || 'General'}
- Fases metodológicas ya cubiertas: ${previousPhases.join(', ')}

### INSTRUCCIÓN:
Genera AHORA las sesiones ${startSession} a ${endSession} (de ${params.numSesiones} totales).
Continúa la progresión pedagógica y secuencia lógica del proyecto.
Distribuye las sesiones en las fases metodológicas que correspondan según la progresión natural.

### ESTRUCTURA JSON REQUERIDA (SOLO secuencia_didactica):
{
  "secuencia_didactica": [
    { 
      "fase_nombre": "Fase Oficial según Metodología", 
      "sesiones": [
        {
          "numero": ${startSession},
          "titulo": "...",
          "duracion": "60 min",
          "inicio": ["..."],
          "desarrollo": ["Modelaje Docente: [Detalle del andamiaje]", "Acción del Alumno: [Detalle]", "..."],
          "cierre": ["..."],
          "recursos": ["..."],
          "evidencia": "..."
        }
      ]
    }
  ]
}
`;

// ─── Merge session batches into one secuencia_didactica ──────────────────────
const mergeSecuencias = (
  base: SecuenciaDidactica[],
  additional: SecuenciaDidactica[]
): SecuenciaDidactica[] => {
  const merged = [...base];

  for (const newPhase of additional) {
    const existingPhase = merged.find(
      p => p.fase_nombre === newPhase.fase_nombre
    );
    if (existingPhase) {
      existingPhase.sesiones.push(...newPhase.sesiones);
    } else {
      merged.push(newPhase);
    }
  }

  return merged;
};

// ─── Main export: generates a full lesson plan, batching if needed ───────────
export type ProgressCallback = (info: { currentBatch: number; totalBatches: number; text: string }) => void;

export const generateLessonPlanStream = async (
  params: PlanningRequest,
  onChunk: (text: string) => void,
  retries = 3,
  onProgress?: ProgressCallback
): Promise<LessonPlan> => {
  const apiKey = (import.meta as any).env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("CONFIGURACIÓN REQUERIDA: No se detectó una VITE_DEEPSEEK_API_KEY en el archivo .env.");
  }

  const totalSessions = params.numSesiones;

  // ── If it fits in one batch, do a single call ──
  if (totalSessions <= MAX_SESSIONS_PER_BATCH) {
    const totalBatches = 1;
    onProgress?.({ currentBatch: 1, totalBatches, text: `Generando ${totalSessions} sesiones...` });

    const systemPrompt = buildSystemInstruction(totalSessions);
    const userPrompt = buildFirstBatchPrompt(params, totalSessions);
    const plan = await callDeepSeek(systemPrompt, userPrompt, retries);
    return plan as LessonPlan;
  }

  // ── Multiple batches needed ──
  const batches: { start: number; end: number }[] = [];
  let cursor = 1;
  while (cursor <= totalSessions) {
    const end = Math.min(cursor + MAX_SESSIONS_PER_BATCH - 1, totalSessions);
    batches.push({ start: cursor, end });
    cursor = end + 1;
  }

  const totalBatches = batches.length;
  console.log(`Generación en lotes: ${totalBatches} lotes para ${totalSessions} sesiones`);

  // ── Batch 1: Full structure + first batch of sessions ──
  onProgress?.({
    currentBatch: 1,
    totalBatches,
    text: `Generando estructura base y sesiones 1-${batches[0].end}...`
  });

  const systemPrompt = buildSystemInstruction(batches[0].end);
  const firstPrompt = buildFirstBatchPrompt(params, batches[0].end);
  const basePlan = await callDeepSeek(systemPrompt, firstPrompt, retries) as LessonPlan;

  // Collect phase names for continuation context
  const previousPhases = basePlan.secuencia_didactica.map(p => p.fase_nombre);

  // ── Subsequent batches: sessions only ──
  for (let i = 1; i < batches.length; i++) {
    const batch = batches[i];

    onProgress?.({
      currentBatch: i + 1,
      totalBatches,
      text: `Generando sesiones ${batch.start}-${batch.end} de ${totalSessions}...`
    });

    // Small delay between batches to avoid rate limits
    await sleep(1000);

    const contSystemPrompt = buildSystemInstruction(batch.end - batch.start + 1);
    const contPrompt = buildContinuationPrompt(
      params,
      batch.start,
      batch.end,
      basePlan.encabezado?.proyecto || "Proyecto NEM",
      basePlan.encabezado?.metodologia || params.metodologia,
      previousPhases
    );

    const batchResult = await callDeepSeek(contSystemPrompt, contPrompt, retries);

    if (batchResult.secuencia_didactica) {
      basePlan.secuencia_didactica = mergeSecuencias(
        basePlan.secuencia_didactica,
        batchResult.secuencia_didactica
      );

      // Track any new phases
      for (const phase of batchResult.secuencia_didactica) {
        if (!previousPhases.includes(phase.fase_nombre)) {
          previousPhases.push(phase.fase_nombre);
        }
      }
    }
  }

  // Ensure the header reflects the total session count
  if (basePlan.encabezado) {
    basePlan.encabezado.num_sesiones = totalSessions;
  }

  return basePlan;
};
