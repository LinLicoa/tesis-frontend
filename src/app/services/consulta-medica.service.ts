import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ConsultaMedica } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConsultaMedicaService {
    private readonly base = environment.apiUrl;
    private readonly path = '/api/consultas-medicas';

    constructor(private http: HttpClient) { }

    /**
     * POST /api/consultas-medicas?pacienteId=...&usuarioId=...
     * Crea una nueva consulta médica.
     */
    crearConsulta(pacienteId: string, usuarioId: string, consulta: ConsultaMedica): Observable<ConsultaMedica> {
        return this.http.post<ConsultaMedica>(
            `${this.base}${this.path}?pacienteId=${pacienteId}&usuarioId=${usuarioId}`,
            consulta
        );
    }

    /**
     * GET /api/consultas-medicas/{id}
     * Obtiene una consulta médica por su ID.
     */
    getConsulta(id: string): Observable<ConsultaMedica> {
        return this.http.get<ConsultaMedica>(`${this.base}${this.path}/${id}`);
    }

    /**
     * GET /api/consultas-medicas/paciente/{pacienteId}
     * Historial de consultas de un paciente.
     */
    getConsultasPorPaciente(pacienteId: string): Observable<ConsultaMedica[]> {
        return this.http.get<ConsultaMedica[]>(`${this.base}${this.path}/paciente/${pacienteId}`);
    }

    /**
     * GET /api/consultas-medicas/usuario/{usuarioId}
     * Consultas realizadas por un médico.
     */
    getConsultasPorUsuario(usuarioId: string): Observable<ConsultaMedica[]> {
        return this.http.get<ConsultaMedica[]>(`${this.base}${this.path}/usuario/${usuarioId}`);
    }

    /**
     * PUT /api/consultas-medicas/{id}
     * Actualiza una consulta médica existente.
     */
    actualizarConsulta(id: string, consulta: ConsultaMedica): Observable<ConsultaMedica> {
        return this.http.put<ConsultaMedica>(`${this.base}${this.path}/${id}`, consulta);
    }

    /**
     * DELETE /api/consultas-medicas/{id}
     * Elimina una consulta médica.
     */
    eliminarConsulta(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}${this.path}/${id}`);
    }
}
