import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Recomendacion } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecomendacionService {
    private readonly base = environment.apiUrl;
    private readonly path = environment.endpoints.recomendaciones;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/recomendaciones
     * Lista todas las recomendaciones disponibles.
     */
    getRecomendaciones(): Observable<Recomendacion[]> {
        return this.http.get<Recomendacion[]>(`${this.base}${this.path}`);
    }

    /**
     * GET /api/recomendaciones/dimension/{dimension}
     * Filtra recomendaciones por dimensión (Ansiedad, Depresion, Estres).
     */
    getByDimension(dimension: string): Observable<Recomendacion[]> {
        return this.http.get<Recomendacion[]>(`${this.base}${this.path}/dimension/${dimension}`);
    }

    /**
     * GET /api/recomendaciones/{id}
     * Obtiene una recomendación específica.
     */
    getRecomendacion(id: string): Observable<Recomendacion> {
        return this.http.get<Recomendacion>(`${this.base}${this.path}/${id}`);
    }

    /**
     * POST /api/recomendaciones
     * Crea una nueva recomendación en el banco de datos.
     */
    createRecomendacion(recomendacion: Recomendacion): Observable<Recomendacion> {
        return this.http.post<Recomendacion>(`${this.base}${this.path}`, recomendacion);
    }
}
