import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Evaluacion, RespuestasEvaluacion, EstadoEvaluacionDTO, ResultadosEvaluacion } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
    private readonly base = environment.apiUrl;
    private readonly path = environment.endpoints.evaluaciones;

    constructor(private http: HttpClient) { }

    /**
     * POST /api/evaluaciones
     * Crea una nueva evaluación psicológica (estado inicial: EN_PROGRESO).
     */
    createEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
        return this.http.post<Evaluacion>(`${this.base}${this.path}`, evaluacion);
    }

    /**
     * POST /api/evaluaciones/{id}/respuestas
     * Envía las respuestas de los cuestionarios e inicia el procesamiento asíncrono.
     */
    enviarRespuestas(evaluacionId: string, respuestas: RespuestasEvaluacion): Observable<EstadoEvaluacionDTO> {
        return this.http.post<EstadoEvaluacionDTO>(
            `${this.base}${this.path}/${evaluacionId}/respuestas`,
            respuestas
        );
    }

    /**
     * GET /api/evaluaciones/{id}/respuestas
     * Obtiene las respuestas enviadas para una evaluación.
     */
    getRespuestas(evaluacionId: string): Observable<RespuestasEvaluacion> {
        return this.http.get<RespuestasEvaluacion>(`${this.base}${this.path}/${evaluacionId}/respuestas`);
    }

    /**
     * GET /api/evaluaciones/{id}/estado
     * Consulta el estado del procesamiento (para polling).
     */
    getEstado(evaluacionId: string): Observable<EstadoEvaluacionDTO> {
        return this.http.get<EstadoEvaluacionDTO>(`${this.base}${this.path}/${evaluacionId}/estado`);
    }

    /**
     * GET /api/evaluaciones/{id}/resultados
     * Obtiene los resultados completos (solo cuando estado = completada).
     */
    getResultados(evaluacionId: string): Observable<ResultadosEvaluacion> {
        return this.http.get<ResultadosEvaluacion>(`${this.base}${this.path}/${evaluacionId}/resultados`);
    }

    /**
     * GET /api/evaluaciones/{id}
     * Obtiene una evaluación por su ID.
     */
    getEvaluacion(id: string): Observable<Evaluacion> {
        return this.http.get<Evaluacion>(`${this.base}${this.path}/${id}`);
    }

    /**
     * GET /api/evaluaciones/paciente/{pacienteId}
     * Historial de evaluaciones de un paciente.
     */
    getEvaluacionesPorPaciente(pacienteId: string): Observable<Evaluacion[]> {
        return this.http.get<Evaluacion[]>(`${this.base}${this.path}/paciente/${pacienteId}`);
    }

    /**
     * GET /api/evaluaciones/usuario/{usuarioId}
     * Evaluaciones realizadas por un profesional.
     */
    getEvaluacionesPorUsuario(usuarioId: string): Observable<Evaluacion[]> {
        return this.http.get<Evaluacion[]>(`${this.base}${this.path}/usuario/${usuarioId}`);
    }
    /**
     * GET /api/evaluaciones/consulta/{consultaId}
     * Obtiene la evaluación asociada a una consulta médica.
     */
    getEvaluacionPorConsulta(consultaId: string): Observable<Evaluacion> {
        return this.http.get<Evaluacion>(`${this.base}${this.path}/consulta/${consultaId}`);
    }
}
