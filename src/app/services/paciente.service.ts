import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Paciente, RelacionUsuarioPaciente } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PacienteService {
    private readonly base = environment.apiUrl;
    private readonly path = environment.endpoints.pacientes;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/pacientes
     * Lista todos los pacientes del sistema.
     */
    getAllPacientes(): Observable<Paciente[]> {
        return this.http.get<Paciente[]>(`${this.base}${this.path}`);
    }

    /**
     * GET /api/pacientes/usuario/{usuarioId}
     * Lista pacientes asociados a un usuario (doctor) via tabla de relación.
     */
    getPacientesPorUsuario(usuarioId: string): Observable<Paciente[]> {
        return this.http.get<Paciente[]>(`${this.base}${this.path}/usuario/${usuarioId}`);
    }

    /**
     * GET /api/pacientes/{id}
     * Obtiene un paciente por ID.
     */
    getPaciente(id: string): Observable<Paciente> {
        return this.http.get<Paciente>(`${this.base}${this.path}/${id}`);
    }

    /**
     * GET /api/pacientes/cedula/{cedula}
     * Busca un paciente por su cédula.
     */
    buscarPorCedula(cedula: string): Observable<Paciente | null> {
        return this.http.get<Paciente | null>(`${this.base}${this.path}/cedula/${cedula}`);
    }

    /**
     * POST /api/pacientes?usuarioId={usuarioId}
     * Crea un nuevo paciente y lo asocia al médico.
     * @param paciente Datos del paciente
     * @param usuarioId ID del médico que registra
     */
    createPaciente(paciente: Paciente, usuarioId: string): Observable<Paciente> {
        const params = new HttpParams().set('usuarioId', usuarioId);
        return this.http.post<Paciente>(`${this.base}${this.path}`, paciente, { params });
    }

    /**
     * POST /api/pacientes/asociar?pacienteId={pacienteId}&usuarioId={usuarioId}
     * Asocia un paciente existente a un médico (útil para referidos).
     * @returns RelacionUsuarioPaciente
     */
    asociarPaciente(pacienteId: string, usuarioId: string): Observable<RelacionUsuarioPaciente> {
        const params = new HttpParams()
            .set('pacienteId', pacienteId)
            .set('usuarioId', usuarioId);
        return this.http.post<RelacionUsuarioPaciente>(`${this.base}${this.path}/asociar`, null, { params });
    }

    /**
     * PUT /api/pacientes/{id}
     * Actualiza un paciente existente.
     */
    updatePaciente(id: string, paciente: Paciente): Observable<Paciente> {
        return this.http.put<Paciente>(`${this.base}${this.path}/${id}`, paciente);
    }

    /**
     * POST /api/pacientes/desasociar?pacienteId={pacienteId}&usuarioId={usuarioId}
     * Desasocia un paciente de un médico (desactiva la relación).
     */
    desasociarPaciente(pacienteId: string, usuarioId: string): Observable<void> {
        const params = new HttpParams()
            .set('pacienteId', pacienteId)
            .set('usuarioId', usuarioId);
        return this.http.post<void>(`${this.base}${this.path}/desasociar`, null, { params });
    }

    /**
     * GET /api/enfermedades-cronicas
     * Lista todas las enfermedades crónicas disponibles.
     */
    getEnfermedadesCronicas(): Observable<import('../models/models').EnfermedadCronicaDTO[]> {
        return this.http.get<import('../models/models').EnfermedadCronicaDTO[]>(`${this.base}${environment.endpoints.enfermedadesCronicas}`);
    }
}
