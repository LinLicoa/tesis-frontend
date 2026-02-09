import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RelacionUsuarioPaciente } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RelacionUsuarioPacienteService {
    private readonly base = environment.apiUrl;
    private readonly path = environment.endpoints.relacionesUsuarioPaciente;

    constructor(private http: HttpClient) { }

    /**
     * POST /api/relaciones-usuario-paciente
     * Crea una nueva relación entre un doctor y un paciente.
     */
    crearRelacion(usuarioId: string, pacienteId: string): Observable<RelacionUsuarioPaciente> {
        const params = new HttpParams()
            .set('usuarioId', usuarioId)
            .set('pacienteId', pacienteId);
        return this.http.post<RelacionUsuarioPaciente>(`${this.base}${this.path}`, null, { params });
    }

    /**
     * GET /api/relaciones-usuario-paciente/usuario/{usuarioId}
     * Obtiene todos los pacientes asociados a un doctor.
     */
    getRelacionesPorUsuario(usuarioId: string): Observable<RelacionUsuarioPaciente[]> {
        return this.http.get<RelacionUsuarioPaciente[]>(`${this.base}${this.path}/usuario/${usuarioId}`);
    }

    /**
     * GET /api/relaciones-usuario-paciente/paciente/{pacienteId}
     * Obtiene todos los doctores asociados a un paciente.
     */
    getRelacionesPorPaciente(pacienteId: string): Observable<RelacionUsuarioPaciente[]> {
        return this.http.get<RelacionUsuarioPaciente[]>(`${this.base}${this.path}/paciente/${pacienteId}`);
    }

    /**
     * DELETE /api/relaciones-usuario-paciente/{id}
     * Desactiva una relación (soft delete).
     */
    desactivarRelacion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}${this.path}/${id}`);
    }
}
