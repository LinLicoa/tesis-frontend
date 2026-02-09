// ============================================
// DTOs de Autenticación
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombreCompleto: string;
  cedulaProfesional: string;
  especialidad: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ValidateOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// Usuario
// ============================================

export type Rol = 'ADMIN' | 'USUARIO';

export interface Usuario {
  id: string;
  nombreCompleto: string;
  cedulaProfesional: string;
  especialidad: string;
  email: string;
  rol: Rol;
  activo: boolean;
  fechaRegistro?: string;
  ultimoAcceso?: string;
}

// ============================================
// Paciente
// ============================================

export interface Paciente {
  id?: string;
  cedula: string;
  nombreEncriptado?: string;
  edad?: number;
  genero?: string;
  enfermedadCronica?: string;
  tipoSangre?: string;
  alergias?: string;
  antecedentesFamiliares?: string;
  ocupacion?: string;
  activo?: boolean;
}

// ============================================
// Consulta Médica
// ============================================

export interface ConsultaMedica {
  id?: string;
  pacienteId: string;
  usuarioId: string;
  fechaHora?: string;
  // Signos Vitales (Triaje)
  presionArterial?: string;
  frecuenciaCardiaca?: number;
  temperatura?: number;
  saturacionOxigeno?: number;
  pesoKg?: number;
  tallaCm?: number;
  // Evolución Clínica
  motivoConsulta: string;
  examenFisico?: string;
  diagnosticoCie10?: string;
  diagnosticoDescripcion?: string;
  planTratamiento?: string;
}

// ============================================
// Relación Usuario-Paciente
// ============================================

export interface RelacionUsuarioPaciente {
  id: number;
  usuarioId: string;
  pacienteId: string;
  fechaRelacion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Cuestionarios
// ============================================

export type TipoCuestionario = 'GAD7' | 'PHQ9' | 'PSS10';

export interface Pregunta {
  id: number;
  texto: string;
  numero: number;
  esInversa?: boolean;
  esCritica?: boolean;
}

export interface CuestionarioAgrupado {
  tipo: TipoCuestionario;
  preguntas: Pregunta[];
}

export interface RespuestaCuestionario {
  preguntaId: number;
  valor: number; // 0-3 typical Likert scale
}

// ============================================
// Evaluación
// ============================================

export type EstadoEvaluacion = 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'en_progreso' | 'completada' | 'cancelada';

export interface Evaluacion {
  id?: string;
  pacienteId: string;
  usuarioId: string;
  consultaId?: string;
  fechaHora?: string;
  estado?: EstadoEvaluacion;

  // Puntajes de cuestionarios
  puntajes?: {
    gad7: number;
    phq9: number;
    pss10: number;
  };
  // Deprecated flat scores
  gad7Puntaje?: number;
  phq9Puntaje?: number;
  pss10Puntaje?: number;

  // Niveles calculados
  niveles?: {
    ansiedad: string;
    depresion: string;
    estres: string;
  };
  // Deprecated flat levels
  nivelAnsiedad?: string;
  nivelDepresion?: string;
  nivelEstres?: string;

  // Tripletas neutrosóficas
  tripletasGlobales?: {
    ansiedad: { t: number; i: number; f: number };
    depresion: { t: number; i: number; f: number };
    estres: { t: number; i: number; f: number };
  };
  // Deprecated flat triplets
  ansiedadT?: number;
  ansiedadI?: number;
  ansiedadF?: number;
  depresionT?: number;
  depresionI?: number;
  depresionF?: number;
  estresT?: number;
  estresI?: number;
  estresF?: number;

  // Probabilidades de adherencia
  probabilidadesAdherencia?: {
    ansiedad: number;
    depresion: number;
    estres: number;
  };
  // Deprecated flat probs
  probAdherenciaAlta?: number;
  probAdherenciaMedia?: number;
  probAdherenciaBaja?: number;

  observaciones?: string;
}

// ============================================
// Recomendación
// ============================================

export type DimensionAplicable = 'Ansiedad' | 'Depresion' | 'Estres';

export interface Recomendacion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  dimensionAplicable: DimensionAplicable;
  prioridad: number;
  esUrgente?: boolean;
}

// ============================================
// Parámetro del Sistema
// ============================================

export type TipoDato = 'INTEGER' | 'BOOLEAN' | 'STRING';

export interface ParametroSistema {
  id: string;
  clave: string;
  valor: string;
  tipoDato: TipoDato;
  categoria?: string;
  editable?: boolean;
}

// ============================================
// Evaluación - DTOs Async
// ============================================

export interface RespuestaItem {
  numeroItem: number;
  respuesta: number;
}

export interface RespuestasEvaluacion {
  gad7: RespuestaItem[];
  phq9: RespuestaItem[];
  pss10: RespuestaItem[];
}

export type EstadoProcesamiento = 'procesando' | 'completada' | 'error';

export interface EstadoEvaluacionDTO {
  evaluacionId: string;
  estado: EstadoProcesamiento;
  progreso: number;
  completado: boolean;
  mensaje?: string;
  resultadosUrl?: string;
}


export interface ResultadosEvaluacion {
  evaluacionId: string;
  fechaEvaluacion: string;
  paciente: {
    id: string;
    edad: number;
    genero: string;
    enfermedadCronica: string;
  };
  puntajes: {
    phq9: number;
    gad7: number;
    pss10: number;
  };
  niveles: {
    ansiedad: string;
    depresion: string;
    estres: string;
  };
  tripletasGlobales: {
    ansiedad: { t: number; i: number; f: number };
    depresion: { t: number; i: number; f: number };
    estres: { t: number; i: number; f: number };
  };
  probabilidadesAdherencia: {
    ansiedad: number;
    depresion: number;
    estres: number;
  };
  recomendaciones: string[];
  alertaCritica?: string;
}

export interface EnfermedadCronicaDTO {
  id: number;
  nombre: string;
  descripcion?: string;
}
