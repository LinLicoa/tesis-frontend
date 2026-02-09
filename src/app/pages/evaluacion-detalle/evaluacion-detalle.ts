import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluacionService } from '../../services/evaluacion.service';
import { Evaluacion, ResultadosEvaluacion } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
    selector: 'app-evaluacion-detalle',
    standalone: true,
    imports: [CommonModule, SidebarComponent],
    templateUrl: './evaluacion-detalle.html',
    styleUrls: ['./evaluacion-detalle.css']
})
export class EvaluacionDetalleComponent implements OnInit {
    evaluacion = signal<Evaluacion | null>(null);
    resultados = signal<ResultadosEvaluacion | null>(null);
    loading = signal(true);
    error = signal('');

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private evaluacionService: EvaluacionService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadData(id);
        } else {
            this.error.set('ID de evaluación no proporcionado');
            this.loading.set(false);
        }
    }

    loadData(id: string) {
        this.evaluacionService.getEvaluacion(id).subscribe({
            next: (data) => {
                this.evaluacion.set(data);
                if (data && (data.estado === 'COMPLETADA' || data.estado === 'completada')) {
                    this.loadResultados(id);
                } else {
                    this.loading.set(false);
                }
            },
            error: (err) => {
                console.error(err);
                this.error.set('Error al cargar la evaluación');
                this.loading.set(false);
            }
        });
    }

    loadResultados(id: string) {
        this.evaluacionService.getResultados(id).subscribe({
            next: (res) => {
                this.resultados.set(res);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                // Si falla resultados, al menos mostramos la evaluación básica
                this.loading.set(false);
            }
        });
    }

    // Helper para el template
    get results() {
        return this.resultados;
    }

    goBack() {
        this.router.navigate(['/consultas']);
    }

    getNivelClass(nivel?: string): string {
        if (!nivel) return '';
        const lower = nivel.toLowerCase();
        if (lower.includes('leve') || lower.includes('bajo') || lower.includes('mínima')) return 'level-low';
        if (lower.includes('moderado') || lower.includes('medio')) return 'level-medium';
        if (lower.includes('severo') || lower.includes('alto') || lower.includes('grave')) return 'level-high';
        return '';
    }
}
