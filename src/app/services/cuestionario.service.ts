import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CuestionarioAgrupado } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CuestionarioService {
    private readonly base = environment.apiUrl;
    private readonly path = environment.endpoints.cuestionarios;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/cuestionarios
     * Obtiene todos los cuestionarios activos agrupados por tipo (GAD7, PHQ9, PSS10).
     */
    getCuestionarios(): Observable<CuestionarioAgrupado[]> {
        return this.http.get<CuestionarioAgrupado[]>(`${this.base}${this.path}`);
    }
}
