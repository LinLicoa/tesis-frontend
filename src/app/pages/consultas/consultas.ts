import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ConsultaMedicaService } from '../../services/consulta-medica.service';
import { PacienteService } from '../../services/paciente.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { ConsultaMedica, Paciente, ResultadosEvaluacion, Evaluacion } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
    selector: 'app-consultas',
    imports: [CommonModule, FormsModule, SidebarComponent],
    templateUrl: './consultas.html',
    styleUrl: './consultas.css',
})
export class ConsultasComponent implements OnInit {
    consultas = signal<ConsultaMedica[]>([]);
    pacientes = signal<Map<string, Paciente>>(new Map());
    evaluaciones = signal<Map<string, ResultadosEvaluacion>>(new Map());
    loading = signal(true);
    expandedId: string | null = null;
    searchTerm = '';

    filteredConsultas = computed(() => {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) return this.consultas();
        return this.consultas().filter(c => {
            const paciente = this.pacientes().get(c.pacienteId);
            const nombre = paciente?.nombreEncriptado?.toLowerCase() || '';
            const cedula = paciente?.cedula?.toLowerCase() || '';
            const motivo = c.motivoConsulta?.toLowerCase() || '';
            return nombre.includes(term) || cedula.includes(term) || motivo.includes(term);
        });
    });

    constructor(
        private auth: AuthService,
        private consultaService: ConsultaMedicaService,
        private pacienteService: PacienteService,
        private evaluacionService: EvaluacionService,
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

        // Load consultas
        this.consultaService.getConsultasPorUsuario(userId).subscribe({
            next: (data) => {
                this.consultas.set(data);
                this.consultas.set(data);
                this.loadPacientes(data);
                this.loadEvaluaciones(data);
            },
            error: () => {
                this.consultas.set([]);
                this.loading.set(false);
            }
        });
    }

    loadPacientes(consultas: ConsultaMedica[]) {
        const uniquePacienteIds = [...new Set(consultas.map(c => c.pacienteId))];
        const pacienteMap = new Map<string, Paciente>();
        let loaded = 0;

        if (uniquePacienteIds.length === 0) {
            this.loading.set(false);
            return;
        }

        uniquePacienteIds.forEach(pacienteId => {
            this.pacienteService.getPaciente(pacienteId).subscribe({
                next: (paciente) => {
                    pacienteMap.set(pacienteId, paciente);
                    loaded++;
                    if (loaded === uniquePacienteIds.length) {
                        this.pacientes.set(pacienteMap);
                        this.loading.set(false);
                    }
                },
                error: () => {
                    loaded++;
                    if (loaded === uniquePacienteIds.length) {
                        this.pacientes.set(pacienteMap);
                        this.loading.set(false);
                    }
                }
            });
        });
    }

    loadEvaluaciones(consultas: ConsultaMedica[]) {
        const evaluacionMap = new Map<string, ResultadosEvaluacion>();
        // Process sequentially or in parallel? For simplicity, let's just try to get by consultaId
        // Assuming there is an endpoint or we can query by consultaId.
        // If the backend API doesn't support bulk fetch, we have to iterate.
        // Optimally, we should have getEvaluacionByConsultaId

        // Since we don't have bulk endpoint and iterating might be too much if many consultations,
        // we will load evaluation ONLY when expanding the details or if we implement a better backend.
        // However, for this requirement, let's load them on demand or eager if few.
        // Let's modify toggleDetails to load evaluation if missing.
    }

    getEvaluacion(consultaId: string): ResultadosEvaluacion | undefined {
        return this.evaluaciones().get(consultaId);
    }

    getPacienteNombre(pacienteId: string): string {
        return this.pacientes().get(pacienteId)?.nombreEncriptado || 'Paciente';
    }

    getPacienteCedula(pacienteId: string): string {
        return this.pacientes().get(pacienteId)?.cedula || '';
    }

    toggleDetails(id?: string) {
        if (!id) return;
        this.expandedId = this.expandedId === id ? null : id;

        // Si cerramos, no hacemos nada más
        if (!this.expandedId) return;

        // Si ya tenemos la evaluación cargada, no hacemos nada más
        if (this.evaluaciones().has(id)) return;

        // Buscamos la consulta para obtener el pacienteId
        const consulta = this.consultas().find(c => c.id === id);
        if (!consulta || !consulta.pacienteId) return;

        // Buscamos las evaluaciones del paciente y filtramos por consultaId
        this.evaluacionService.getEvaluacionesPorPaciente(consulta.pacienteId).subscribe({
            next: (evaluaciones) => {
                const evaluacionEncontrada = evaluaciones.find(e => e.consultaId === id);

                if (evaluacionEncontrada && evaluacionEncontrada.id) {
                    // Si la encontramos, cargamos sus resultados si está completada
                    if (evaluacionEncontrada.estado === 'COMPLETADA' || evaluacionEncontrada.estado === 'completada') {
                        this.evaluacionService.getResultados(evaluacionEncontrada.id).subscribe(resultados => {
                            const current = new Map(this.evaluaciones());
                            // Combinamos la info base de la evaluación con los resultados
                            const fullData = { ...evaluacionEncontrada, ...resultados };
                            current.set(id, fullData);
                            this.evaluaciones.set(current);
                        });
                    } else {
                        // Si no está completada o no tiene resultados aún, guardamos lo que tenemos adaptado
                        const current = new Map(this.evaluaciones());
                        // Adaptamos Evaluacion a ResultadosEvaluacion (o parcial)
                        const partialResult = {
                            ...evaluacionEncontrada,
                            evaluacionId: evaluacionEncontrada.id
                        } as any;
                        current.set(id, partialResult);
                        this.evaluaciones.set(current);
                    }
                } else {
                    console.log('No se encontró evaluación para esta consulta');
                }
            },
            error: (err) => console.error('Error cargando evaluaciones del paciente', err)
        });
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    goToNuevaConsulta() {
        this.router.navigate(['/nueva-consulta']);
    }

    goToEvaluacionDetalle(evaluacionId?: string) {
        if (evaluacionId) {
            this.router.navigate(['/evaluacion', evaluacionId]);
        }
    }

    onSearch() {
        // Reactivo con computed
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
