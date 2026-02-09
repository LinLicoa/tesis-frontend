import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { interval, Subscription, takeWhile, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PacienteService } from '../../services/paciente.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { CuestionarioService } from '../../services/cuestionario.service';
import {
    Paciente,
    Evaluacion,
    CuestionarioAgrupado,
    TipoCuestionario,
    RespuestaItem,
    RespuestasEvaluacion,
    EstadoEvaluacionDTO,
    ResultadosEvaluacion
} from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

type Step = 'loading' | 'paciente' | 'cuestionario' | 'procesando' | 'resultados';

@Component({
    selector: 'app-nueva-evaluacion',
    imports: [CommonModule, FormsModule, SidebarComponent],
    templateUrl: './nueva-evaluacion.html',
    styleUrl: './nueva-evaluacion.css',
})
export class NuevaEvaluacionComponent implements OnInit, OnDestroy {
    // Step management
    currentStep = signal<Step>('loading');
    currentQuestionnaireIndex = signal(0);
    currentQuestionIndex = signal(0);

    // Data
    pacientes = signal<Paciente[]>([]);
    selectedPaciente = signal<Paciente | null>(null);
    cuestionarios = signal<CuestionarioAgrupado[]>([]);
    evaluacion = signal<Evaluacion | null>(null);

    // Responses stored by questionnaire type
    respuestas = signal<Map<TipoCuestionario, RespuestaItem[]>>(new Map());

    // Processing state
    estadoProcesamiento = signal<EstadoEvaluacionDTO | null>(null);
    resultados = signal<ResultadosEvaluacion | null>(null);
    private pollingSubscription?: Subscription;

    // UI State
    loading = signal(true);
    submitting = signal(false);
    validatingSelection = signal(false);
    error = signal('');

    // Computed Likert options based on questionnaire type
    currentOptions = computed(() => {
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

        // Default for GAD7 and PHQ9 (0-3)
        return [
            { value: 0, label: 'Nunca' },
            { value: 1, label: 'Varios días' },
            { value: 2, label: 'Más de la mitad de los días' },
            { value: 3, label: 'Casi todos los días' },
        ];
    });

    // Computed values
    currentQuestionnaire = computed(() => {
        const cuests = this.cuestionarios();
        const idx = this.currentQuestionnaireIndex();
        return cuests[idx] || null;
    });

    currentQuestion = computed(() => {
        const quest = this.currentQuestionnaire();
        const idx = this.currentQuestionIndex();
        return quest?.preguntas[idx] || null;
    });

    progress = computed(() => {
        const questionnaire = this.currentQuestionnaire();
        if (!questionnaire) return 0;
        const answered = this.respuestas().get(questionnaire.tipo)?.length || 0;
        return Math.round((answered / questionnaire.preguntas.length) * 100);
    });

    totalProgress = computed(() => {
        const cuests = this.cuestionarios();
        if (cuests.length === 0) return 0;
        const completedQuestionnaires = this.currentQuestionnaireIndex();
        return Math.round((completedQuestionnaires / cuests.length) * 100);
    });

    constructor(
        private auth: AuthService,
        private pacienteService: PacienteService,
        private evaluacionService: EvaluacionService,
        private cuestionarioService: CuestionarioService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.loadData();
    }

    ngOnDestroy() {
        this.pollingSubscription?.unsubscribe();
    }

    loadData() {
        const userId = this.auth.getUserId();
        if (!userId) {
            this.router.navigate(['/login']);
            return;
        }

        this.loading.set(true);

        forkJoin({
            pacientes: this.pacienteService.getPacientesPorUsuario(userId),
            evaluaciones: this.evaluacionService.getEvaluacionesPorUsuario(userId),
            cuestionarios: this.cuestionarioService.getCuestionarios()
        }).subscribe({
            next: ({ pacientes, evaluaciones, cuestionarios }) => {
                this.cuestionarios.set(cuestionarios);
                const initialMap = new Map();
                cuestionarios.forEach(q => initialMap.set(q.tipo, []));
                this.respuestas.set(initialMap);

                const evalId = this.route.snapshot.paramMap.get('id');

                if (evalId) {
                    // Resume Mode
                    this.pacientes.set(pacientes);
                    this.resumeEvaluation(evalId, evaluaciones);
                } else {
                    // New Evaluation Mode: Filter out patients with active evaluations
                    const activePatientIds = new Set(
                        evaluaciones
                            .filter(e => e.estado === 'EN_PROGRESO' || e.estado === 'en_progreso')
                            .map(e => e.pacienteId)
                    );

                    const availablePatients = pacientes.filter(p => !activePatientIds.has(p.id!));
                    this.pacientes.set(availablePatients);
                    this.loading.set(false);
                    this.currentStep.set('paciente');
                }
            },
            error: () => {
                this.error.set('Error al cargar datos');
                this.loading.set(false);
            }
        });
    }

    resumeEvaluation(id: string, evals: Evaluacion[]) {
        const ev = evals.find(e => e.id === id);
        if (ev && (ev.estado === 'EN_PROGRESO' || ev.estado === 'en_progreso')) {
            const paciente = this.pacientes().find(p => p.id === ev.pacienteId);
            if (paciente) {
                this.selectedPaciente.set(paciente);
                this.evaluacion.set(ev);

                // Fetch saved responses
                this.evaluacionService.getRespuestas(id).subscribe({
                    next: (savedResp) => {
                        this.hydrateResponses(savedResp);
                        this.currentStep.set('cuestionario');
                        this.loading.set(false);
                    },
                    error: () => {
                        // If no saves responses (404), it's fine, start from scratch
                        this.currentStep.set('cuestionario');
                        this.loading.set(false);
                    }
                });
            } else {
                this.error.set('Paciente no encontrado para esta evaluación');
                this.loading.set(false);
            }
        } else {
            this.error.set('Evaluación no encontrada o no está en progreso');
            this.router.navigate(['/evaluaciones']);
            this.loading.set(false);
        }
    }

    hydrateResponses(saved: RespuestasEvaluacion) {
        if (!saved) return;

        this.respuestas.update(current => {
            const newMap = new Map(current);
            if (saved.gad7) newMap.set('GAD7', saved.gad7);
            if (saved.phq9) newMap.set('PHQ9', saved.phq9);
            if (saved.pss10) newMap.set('PSS10', saved.pss10);
            return newMap;
        });

        // Find where we left off
        const questionnaires = this.cuestionarios();
        for (let i = 0; i < questionnaires.length; i++) {
            const type = questionnaires[i].tipo;
            const answers = this.respuestas().get(type) || [];

            // If this questionnaire is not fully answered, let's stop here
            if (answers.length < questionnaires[i].preguntas.length) {
                this.currentQuestionnaireIndex.set(i);
                this.currentQuestionIndex.set(answers.length); // Next question index
                return;
            }
        }
    }

    selectPaciente(paciente: Paciente) {
        this.selectedPaciente.set(paciente);

        // Check for existing in-progress evaluation
        // This requires fetching evaluations for this patient.
        // Since we don't have a direct endpoint for specific patient evaluations status without fetching all,
        // we will do a quick check on the list if we have it, or fetch.
        // Ideally we should have `currentEvaluation`? 
        // Let's fetch all evaluations for this user (cached or fresh) to check.

        const userId = this.auth.getUserId();
        if (userId) {
            this.validatingSelection.set(true);
            this.evaluacionService.getEvaluacionesPorUsuario(userId).subscribe({
                next: (evals) => {
                    const existing = evals.find(e => e.pacienteId === paciente.id && (e.estado === 'EN_PROGRESO' || e.estado === 'en_progreso'));
                    if (existing) {
                        if (confirm(`Este paciente tiene una evaluación en progreso del ${new Date(existing.fechaHora!).toLocaleDateString()}. ¿Desea continuarla?`)) {
                            this.evaluacion.set(existing);
                            // Fetch saved responses
                            this.evaluacionService.getRespuestas(existing.id!).subscribe({
                                next: (savedResp) => {
                                    this.hydrateResponses(savedResp);
                                    this.currentStep.set('cuestionario');
                                },
                                error: () => {
                                    this.currentStep.set('cuestionario');
                                }
                            });
                        } else {
                            // User chose NOT to continue.
                            alert("No se puede crear una nueva evaluación mientras exista una en progreso.");
                            this.selectedPaciente.set(null); // Deselect logic
                        }
                    }
                    this.validatingSelection.set(false);
                },
                error: () => {
                    this.validatingSelection.set(false);
                    // On error, let them proceed? Or block? Better to let proceed or show error.
                    // We'll assume check passed if error to avoid blocking.
                }
            });
        }
    }

    startEvaluation() {
        const paciente = this.selectedPaciente();
        const userId = this.auth.getUserId();

        if (!paciente?.id || !userId) return;

        this.submitting.set(true);
        this.error.set('');

        const evaluacion: Evaluacion = {
            pacienteId: paciente.id,
            usuarioId: userId,
            estado: 'EN_PROGRESO',
        };

        this.evaluacionService.createEvaluacion(evaluacion).subscribe({
            next: (created) => {
                this.evaluacion.set(created);
                this.submitting.set(false);
                this.currentStep.set('cuestionario');
            },
            error: () => {
                this.error.set('Error al crear la evaluación');
                this.submitting.set(false);
            },
        });
    }

    answerQuestion(value: number) {
        const questionnaire = this.currentQuestionnaire();
        const question = this.currentQuestion();

        if (!questionnaire || !question) return;

        const responses = this.respuestas().get(questionnaire.tipo) || [];
        const existingIdx = responses.findIndex(r => r.numeroItem === question.numero);

        if (existingIdx >= 0) {
            responses[existingIdx].respuesta = value;
        } else {
            responses.push({ numeroItem: question.numero, respuesta: value });
        }

        // Trigger update by creating new Map
        this.respuestas.update(map => {
            const newMap = new Map(map);
            newMap.set(questionnaire.tipo, [...responses]); // Also copy array to be safe, though not strictly needed if map is new
            return newMap;
        });

        // DELAY for UX
        setTimeout(() => {
            // Move to next question or next questionnaire
            const nextQuestionIdx = this.currentQuestionIndex() + 1;

            if (nextQuestionIdx < questionnaire.preguntas.length) {
                this.currentQuestionIndex.set(nextQuestionIdx);
            } else {
                // Move to next questionnaire
                const nextQuestIdx = this.currentQuestionnaireIndex() + 1;

                if (nextQuestIdx < this.cuestionarios().length) {
                    this.currentQuestionnaireIndex.set(nextQuestIdx);
                    this.currentQuestionIndex.set(0);
                } else {
                    // All questionnaires completed - submit responses
                    this.submitResponses();
                }
            }
        }, 300); // 300ms delay
    }

    previousQuestion() {
        const currentQ = this.currentQuestionIndex();

        if (currentQ > 0) {
            this.currentQuestionIndex.set(currentQ - 1);
        } else {
            const currentQuestIdx = this.currentQuestionnaireIndex();
            if (currentQuestIdx > 0) {
                this.currentQuestionnaireIndex.set(currentQuestIdx - 1);
                const prevQuest = this.cuestionarios()[currentQuestIdx - 1];
                this.currentQuestionIndex.set(prevQuest.preguntas.length - 1);
            }
        }
    }

    getCurrentAnswer(): number | null {
        const questionnaire = this.currentQuestionnaire();
        const question = this.currentQuestion();

        if (!questionnaire || !question) return null;

        const responses = this.respuestas().get(questionnaire.tipo) || [];
        const response = responses.find(r => r.numeroItem === question.numero);
        return response?.respuesta ?? null;
    }

    submitResponses() {
        const evalId = this.evaluacion()?.id;
        if (!evalId) return;

        this.currentStep.set('procesando');
        this.error.set('');

        const respuestasDTO: RespuestasEvaluacion = {
            gad7: this.respuestas().get('GAD7') || [],
            phq9: this.respuestas().get('PHQ9') || [],
            pss10: this.respuestas().get('PSS10') || [],
        };

        this.evaluacionService.enviarRespuestas(evalId, respuestasDTO).subscribe({
            next: (estado) => {
                this.estadoProcesamiento.set(estado);
                this.startPolling(evalId);
            },
            error: () => {
                this.error.set('Error al enviar respuestas');
                this.currentStep.set('cuestionario');
            },
        });
    }

    startPolling(evaluacionId: string) {
        this.pollingSubscription = interval(2000)
            .pipe(
                takeWhile(() => !this.estadoProcesamiento()?.completado, true)
            )
            .subscribe(() => {
                this.evaluacionService.getEstado(evaluacionId).subscribe({
                    next: (estado) => {
                        this.estadoProcesamiento.set(estado);

                        if (estado.completado && estado.estado === 'completada') {
                            this.loadResultados(evaluacionId);
                        } else if (estado.estado === 'error') {
                            this.error.set(estado.mensaje || 'Error en el procesamiento');
                            this.pollingSubscription?.unsubscribe();
                        }
                    },
                    error: () => {
                        this.error.set('Error al consultar estado');
                    },
                });
            });
    }

    loadResultados(evaluacionId: string) {
        this.evaluacionService.getResultados(evaluacionId).subscribe({
            next: (resultados) => {
                this.resultados.set(resultados);
                this.currentStep.set('resultados');
                this.pollingSubscription?.unsubscribe();
            },
            error: () => {
                this.error.set('Error al cargar resultados');
            },
        });
    }

    goToEvaluaciones() {
        this.router.navigate(['/evaluaciones']);
    }

    getQuestionnaireLabel(tipo: TipoCuestionario | undefined): string {
        switch (tipo) {
            case 'GAD7': return 'Escala de Ansiedad (GAD-7)';
            case 'PHQ9': return 'Escala de Depresión (PHQ-9)';
            case 'PSS10': return 'Escala de Estrés (PSS-10)';
            default: return 'Cuestionario';
        }
    }

    getNivelClass(nivel: string): string {
        const lower = nivel?.toLowerCase() || '';
        if (lower.includes('bajo') || lower.includes('mínimo') || lower.includes('leve')) return 'level-low';
        if (lower.includes('moderado')) return 'level-medium';
        if (lower.includes('alto') || lower.includes('severo')) return 'level-high';
        return '';
    }
}
