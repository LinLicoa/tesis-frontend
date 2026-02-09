import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ParametroSistema } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParametroSistemaService {
    private readonly base = environment.apiUrl;
    private readonly path = environment.endpoints.parametrosSistema;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/parametros-sistema
     * Lista todas las configuraciones del sistema.
     * Requiere rol ADMIN.
     */
    getParametros(): Observable<ParametroSistema[]> {
        return this.http.get<ParametroSistema[]>(`${this.base}${this.path}`);
    }

    /**
     * GET /api/parametros-sistema/{id}
     * Obtiene un parámetro por ID.
     */
    getParametro(id: string): Observable<ParametroSistema> {
        return this.http.get<ParametroSistema>(`${this.base}${this.path}/${id}`);
    }

    /**
     * GET /api/parametros-sistema/clave/{clave}
     * Obtiene un parámetro por su clave única.
     */
    getParametroByClave(clave: string): Observable<ParametroSistema> {
        return this.http.get<ParametroSistema>(`${this.base}${this.path}/clave/${clave}`);
    }

    /**
     * POST /api/parametros-sistema
     * Crea un nuevo parámetro.
     */
    createParametro(parametro: ParametroSistema): Observable<ParametroSistema> {
        return this.http.post<ParametroSistema>(`${this.base}${this.path}`, parametro);
    }

    /**
     * PUT /api/parametros-sistema/{id}
     * Actualiza un parámetro existente.
     */
    updateParametro(id: string, parametro: ParametroSistema): Observable<ParametroSistema> {
        return this.http.put<ParametroSistema>(`${this.base}${this.path}/${id}`, parametro);
    }

    /**
     * DELETE /api/parametros-sistema/{id}
     * Elimina un parámetro.
     */
    deleteParametro(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}${this.path}/${id}`);
    }
}
