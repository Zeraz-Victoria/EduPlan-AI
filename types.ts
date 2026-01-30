
export type Methodology = 
  | 'Proyectos Comunitarios' 
  | 'Aprendizaje Basado en Indagación (STEAM)' 
  | 'Aprendizaje Basado en Problemas (ABP)' 
  | 'Aprendizaje Servicio (AS)';

export interface ContentPdaPair {
  asignatura: string;
  contenido: string;
  pda_vinculados: string[];
}

export interface Session {
  numero: number;
  titulo: string;
  duracion: string;
  actividades_inicio: string[];
  actividades_desarrollo: string[];
  actividades_cierre: string[];
  recursos: string[];
  evaluacion_sesion: string;
  paj_vinculado?: string; // Pensamiento de Aprendizaje Justificado
}

export interface Phase {
  nombre: string;
  descripcion: string;
  sesiones: Session[];
}

export interface Bibliography {
  autor: string;
  titulo: string;
  año: string;
  uso: string;
}

export interface Evaluation {
  tecnicas: string[];
  instrumentos: string[];
  criterios_evaluacion: string[];
}

export interface LessonPlan {
  titulo_proyecto: string;
  nombre_docente: string;
  nombre_escuela: string;
  cct?: string;
  zona_escolar?: string;
  grado: string;
  fase_nem: string;
  metodologia: Methodology;
  campo_formativo: string[];
  ejes_articuladores: string[];
  vinculacion_contenido_pda: ContentPdaPair[];
  proposito: string;
  diagnostico_socioeducativo: string;
  temporalidad_realista: string;
  fases_desarrollo: Phase[];
  evaluacion_formativa: Evaluation;
  bibliografia_especializada: Bibliography[];
}

export interface PlanningRequest {
  pdfBase64?: string;
  pdfName?: string;
  nombreDocente: string;
  nombreEscuela: string;
  cct?: string;
  zonaEscolar?: string;
  fase: string;
  grado: string;
  metodologia: Methodology;
  contextoAdicional?: string;
  numSesiones: number;
}
