import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { PacienteService } from '../../services/paciente.service';
import { ConsultaMedicaService } from '../../services/consulta-medica.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { CuestionarioService } from '../../services/cuestionario.service';
import { Paciente, ConsultaMedica, Evaluacion, CuestionarioAgrupado, RespuestaItem, RespuestasEvaluacion, ResultadosEvaluacion } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

type Step = 'paciente' | 'vitales' | 'clinica' | 'cuestionarios' | 'procesando' | 'resultados';

@Component({
    selector: 'app-nueva-consulta',
    imports: [CommonModule, FormsModule, SidebarComponent],
    templateUrl: './nueva-consulta.html',
    styleUrl: './nueva-consulta.css',
})
export class NuevaConsultaComponent implements OnInit {
    currentStep = signal<Step>('paciente');
    loading = signal(false);
    error = signal('');

    // Step 1: Paciente
    searchCedula = '';
    pacienteEncontrado: Paciente | null = null;
    isNewPaciente = false;
    pacienteForm: Paciente = {
        cedula: '',
        nombreEncriptado: '',
        edad: undefined,
        genero: '',
        enfermedadCronica: '',
        tipoSangre: '',
        alergias: '',
        antecedentesFamiliares: '',
        ocupacion: ''
    };

    // Step 2: Signos Vitales
    consultaForm: Partial<ConsultaMedica> = {
        presionArterial: '',
        frecuenciaCardiaca: undefined,
        temperatura: undefined,
        saturacionOxigeno: undefined,
        pesoKg: undefined,
        tallaCm: undefined
    };

    // Step 3: Evolución Clínica
    clinicaForm = {
        motivoConsulta: '',
        examenFisico: '',
        diagnosticoCie10: '',
        diagnosticoDescripcion: '',
        planTratamiento: ''
    };

    // Step 4: Cuestionarios
    cuestionarios = signal<CuestionarioAgrupado[]>([]);
    respuestas: { [tipo: string]: { [numero: number]: number } } = {
        'GAD7': {},
        'PHQ9': {},
        'PSS10': {}
    };
    currentQuestionnaireIndex = signal(0);
    skipEvaluacion = false;

    // Step 5: Resultados
    consultaCreada: ConsultaMedica | null = null;
    evaluacionCreada: Evaluacion | null = null;
    resultados: ResultadosEvaluacion | null = null;
    processingProgress = 0;

    // Computed
    currentQuestionnaire = computed(() => {
        const cuests = this.cuestionarios();
        const index = this.currentQuestionnaireIndex();
        return cuests[index] || null;
    });

    imc = computed(() => {
        const peso = this.consultaForm.pesoKg;
        const talla = this.consultaForm.tallaCm;
        if (peso && talla && talla > 0) {
            const tallaM = talla / 100;
            return (peso / (tallaM * tallaM)).toFixed(1);
        }
        return null;
    });

    constructor(
        private auth: AuthService,
        private pacienteService: PacienteService,
        private consultaService: ConsultaMedicaService,
        private evaluacionService: EvaluacionService,
        private cuestionarioService: CuestionarioService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        const pacienteId = this.route.snapshot.paramMap.get('pacienteId');
        if (pacienteId) {
            this.loadPaciente(pacienteId);
        }
        this.loadCuestionarios();
    }

    loadPaciente(id: string) {
        this.loading.set(true);
        this.pacienteService.getPaciente(id).subscribe({
            next: (p: Paciente) => {
                this.pacienteEncontrado = p;
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    loadCuestionarios() {
        this.cuestionarioService.getCuestionarios().subscribe({
            next: (data: CuestionarioAgrupado[]) => this.cuestionarios.set(data),
            error: () => console.error('Error loading cuestionarios')
        });
    }

    // Step 1: Methods
    buscarPaciente() {
        if (!this.searchCedula.trim()) return;
        this.loading.set(true);
        this.error.set('');

        this.pacienteService.buscarPorCedula(this.searchCedula).subscribe({
            next: (p: Paciente | null) => {
                if (p) {
                    this.pacienteEncontrado = p;
                    this.isNewPaciente = false;
                } else {
                    this.pacienteEncontrado = null;
                    this.isNewPaciente = true;
                    this.pacienteForm.cedula = this.searchCedula;
                }
                this.loading.set(false);
            },
            error: () => {
                this.pacienteEncontrado = null;
                this.isNewPaciente = true;
                this.pacienteForm.cedula = this.searchCedula;
                this.loading.set(false);
            }
        });
    }

    selectPaciente() {
        if (this.pacienteEncontrado) {
            this.currentStep.set('vitales');
        }
    }

    createPaciente() {
        if (!this.pacienteForm.cedula || !this.pacienteForm.nombreEncriptado) {
            this.error.set('Cédula y nombre son requeridos');
            return;
        }

        this.loading.set(true);
        const userId = this.auth.getUserId();
        if (!userId) return;

        this.pacienteService.createPaciente(this.pacienteForm, userId).subscribe({
            next: (p: Paciente) => {
                this.pacienteEncontrado = p;
                this.isNewPaciente = false;
                this.loading.set(false);
                this.currentStep.set('vitales');
            },
            error: (err: any) => {
                this.error.set(err.error?.message || 'Error al crear paciente');
                this.loading.set(false);
            }
        });
    }

    // Step 2: Vitales
    goToClinica() {
        this.currentStep.set('clinica');
    }

    // Step 3: Clínica
    goToCuestionarios() {
        if (!this.clinicaForm.motivoConsulta.trim()) {
            this.error.set('El motivo de consulta es requerido');
            return;
        }
        this.error.set('');
        this.currentStep.set('cuestionarios');
    }

    // Step 4: Cuestionarios
    selectRespuesta(tipo: string, numero: number, valor: number) {
        this.respuestas[tipo][numero] = valor;
    }

    isRespuestaSelected(tipo: string, numero: number, valor: number): boolean {
        return this.respuestas[tipo][numero] === valor;
    }

    nextQuestionnaire() {
        if (this.currentQuestionnaireIndex() < this.cuestionarios().length - 1) {
            this.currentQuestionnaireIndex.update(v => v + 1);
        }
    }

    prevQuestionnaire() {
        if (this.currentQuestionnaireIndex() > 0) {
            this.currentQuestionnaireIndex.update(v => v - 1);
        }
    }

    isCurrentQuestionnaireComplete(): boolean {
        const current = this.currentQuestionnaire();
        if (!current) return false;
        return current.preguntas.every(p => this.respuestas[current.tipo][p.numero] !== undefined);
    }

    areAllQuestionnairesComplete(): boolean {
        return this.cuestionarios().every(c =>
            c.preguntas.every(p => this.respuestas[c.tipo][p.numero] !== undefined)
        );
    }

    getOptionsForCurrentQuestionnaire() {
        const type = this.currentQuestionnaire()?.tipo;
        if (type === 'PSS10') {
            return [
                { value: 0, label: 'Nunca' },
                { value: 1, label: 'Casi nunca' },
                { value: 2, label: 'A veces' },
                { value: 3, label: 'A menudo' },
                { value: 4, label: 'Muy a menudo' }
            ];
        }
        return [
            { value: 0, label: 'Nunca' },
            { value: 1, label: 'Varios días' },
            { value: 2, label: 'Más de la mitad de los días' },
            { value: 3, label: 'Casi todos los días' }
        ];
    }

    skipToResults() {
        this.skipEvaluacion = true;
        this.finalizarConsulta();
    }

    finalizarConsulta() {
        this.currentStep.set('procesando');
        this.processingProgress = 0;
        this.createConsultaAndEvaluacion();
    }

    async createConsultaAndEvaluacion() {
        const userId = this.auth.getUserId();
        if (!userId || !this.pacienteEncontrado?.id) {
            this.error.set('Error: datos de sesión inválidos');
            return;
        }

        try {
            this.processingProgress = 20;
            const consulta: ConsultaMedica = {
                pacienteId: this.pacienteEncontrado.id,
                usuarioId: userId,
                ...this.consultaForm,
                ...this.clinicaForm
            } as ConsultaMedica;

            this.consultaCreada = await this.consultaService.crearConsulta(
                this.pacienteEncontrado.id,
                userId,
                consulta
            ).toPromise() || null;

            this.processingProgress = 40;

            if (!this.skipEvaluacion && this.areAllQuestionnairesComplete()) {
                const evaluacion: Evaluacion = {
                    pacienteId: this.pacienteEncontrado.id,
                    usuarioId: userId,
                    consultaId: this.consultaCreada?.id
                };

                this.evaluacionCreada = await this.evaluacionService.createEvaluacion(evaluacion).toPromise() || null;
                this.processingProgress = 60;

                if (this.evaluacionCreada?.id) {
                    const respuestasDTO: RespuestasEvaluacion = {
                        gad7: this.formatRespuestas('GAD7'),
                        phq9: this.formatRespuestas('PHQ9'),
                        pss10: this.formatRespuestas('PSS10')
                    };

                    await this.evaluacionService.enviarRespuestas(this.evaluacionCreada.id, respuestasDTO).toPromise();
                    this.processingProgress = 80;

                    await this.pollForResults(this.evaluacionCreada.id);
                }
            } else {
                this.processingProgress = 100;
                this.currentStep.set('resultados');
            }
        } catch (err: any) {
            this.error.set(err.message || 'Error al procesar la consulta');
            this.currentStep.set('resultados');
        }
    }

    formatRespuestas(tipo: string): RespuestaItem[] {
        const items: RespuestaItem[] = [];
        const respTipo = this.respuestas[tipo];
        for (const numero in respTipo) {
            items.push({
                numeroItem: parseInt(numero),
                respuesta: respTipo[numero]
            });
        }
        return items.sort((a, b) => a.numeroItem - b.numeroItem);
    }

    async pollForResults(evaluacionId: string) {
        const maxAttempts = 30;
        let attempts = 0;

        const poll = async () => {
            try {
                const estado = await this.evaluacionService.getEstado(evaluacionId).toPromise();
                if (estado?.completado) {
                    this.resultados = await this.evaluacionService.getResultados(evaluacionId).toPromise() || null;
                    this.processingProgress = 100;
                    this.currentStep.set('resultados');
                } else if (attempts < maxAttempts) {
                    attempts++;
                    this.processingProgress = Math.min(95, 80 + attempts);
                    setTimeout(poll, 2000);
                } else {
                    this.error.set('Tiempo de espera agotado. Los resultados pueden tardar más.');
                    this.currentStep.set('resultados');
                }
            } catch {
                this.currentStep.set('resultados');
            }
        };

        await poll();
    }

    goBack() {
        const steps: Step[] = ['paciente', 'vitales', 'clinica', 'cuestionarios'];
        const currentIndex = steps.indexOf(this.currentStep());
        if (currentIndex > 0) {
            this.currentStep.set(steps[currentIndex - 1]);
        }
    }

    goToConsultas() {
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
