import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { PacienteService } from '../../services/paciente.service';
import { Evaluacion, Paciente, RespuestasEvaluacion } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
    selector: 'app-evaluaciones',
    imports: [CommonModule, FormsModule, SidebarComponent],
    templateUrl: './evaluaciones.html',
    styleUrl: './evaluaciones.css',
})
export class EvaluacionesComponent implements OnInit {
    evaluaciones = signal<Evaluacion[]>([]);
    pacientes = signal<Paciente[]>([]);
    loading = signal(true);

    // Filter
    filterEstado = '';
    filterDimension = '';

    // Expanded evaluation for details
    expandedId: string | null = null;
    respuestasExpandidas: Map<string, RespuestasEvaluacion> = new Map();
    loadingRespuestas: Map<string, boolean> = new Map();

    constructor(
        private auth: AuthService,
        private evaluacionService: EvaluacionService,
        private pacienteService: PacienteService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        const userId = this.auth.getUserId();
        if (!userId) {
            this.loading.set(false);
            return;
        }

        // Load pacientes first for reference
        this.pacienteService.getPacientesPorUsuario(userId).subscribe({
            next: (data) => this.pacientes.set(data),
            error: () => this.pacientes.set([]),
        });

        // Load evaluaciones
        this.evaluacionService.getEvaluacionesPorUsuario(userId).subscribe({
            next: (data) => {
                // Sort by date descending
                const sorted = data.sort((a, b) => {
                    const dateA = new Date(a.fechaHora || 0).getTime();
                    const dateB = new Date(b.fechaHora || 0).getTime();
                    return dateB - dateA;
                });
                this.evaluaciones.set(sorted);
                this.loading.set(false);
            },
            error: () => {
                this.evaluaciones.set([]);
                this.loading.set(false);
            },
        });
    }

    get filteredEvaluaciones(): Evaluacion[] {
        let result = this.evaluaciones();

        if (this.filterEstado) {
            result = result.filter((e) => e.estado === this.filterEstado);
        }

        return result;
    }

    getPacienteNombre(pacienteId: string): string {
        const paciente = this.pacientes().find((p) => p.id === pacienteId);
        return paciente?.nombreEncriptado || 'Paciente desconocido';
    }

    toggleDetails(id?: string) {
        if (!id) return;
        this.expandedId = this.expandedId === id ? null : id;

        if (this.expandedId && !this.respuestasExpandidas.has(id) && !this.loadingRespuestas.get(id)) {
            this.loadingRespuestas.set(id, true);
            this.evaluacionService.getRespuestas(id).subscribe({
                next: (respuestas) => {
                    this.respuestasExpandidas.set(id, respuestas);
                    this.loadingRespuestas.set(id, false);
                },
                error: (err) => {
                    console.error('Error loading responses', err);
                    this.loadingRespuestas.set(id, false);
                    // Optionally set empty responses or error state
                }
            });
        }
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    getNivelClass(nivel?: string): string {
        if (!nivel) return 'level-none';
        const lower = nivel.toLowerCase();
        if (lower.includes('leve') || lower.includes('bajo') || lower.includes('mínimo')) return 'level-low';
        if (lower.includes('moderado') || lower.includes('medio')) return 'level-medium';
        if (lower.includes('severo') || lower.includes('alto') || lower.includes('grave')) return 'level-high';
        return 'level-none';
    }

    getRespuestas(id?: string): RespuestasEvaluacion | undefined {
        return id ? this.respuestasExpandidas.get(id) : undefined;
    }

    isLoadingRespuestas(id?: string): boolean {
        return id ? !!this.loadingRespuestas.get(id) : false;
    }

    getScoreColor(score?: number, max: number = 21): string {
        if (score === undefined || score === null) return '';
        const percent = (score / max) * 100;
        if (percent <= 33) return 'score-low';
        if (percent <= 66) return 'score-medium';
        return 'score-high';
    }

    goToNuevaEvaluacion(id?: string) {
        if (id) {
            this.router.navigate(['/evaluaciones/nueva', id]);
        } else {
            this.router.navigate(['/evaluaciones/nueva']);
        }
    }
}
