import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PacienteService } from '../../services/paciente.service';
import { isValidCedula, isValidNombreCompleto } from '../../utils/validators';
import { Paciente, EnfermedadCronicaDTO } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
    selector: 'app-pacientes',
    imports: [CommonModule, FormsModule, SidebarComponent],
    templateUrl: './pacientes.html',
    styleUrl: './pacientes.css',
})
export class PacientesComponent implements OnInit {
    pacientes = signal<Paciente[]>([]);
    filteredPacientes = signal<Paciente[]>([]);
    loading = signal(true);
    searchTerm = '';

    // Enfermedades Crónicas
    enfermedadesDisponibles = signal<EnfermedadCronicaDTO[]>([]);
    enfermedadesSeleccionadas = signal<string[]>([]);
    filteredEnfermedades = computed(() => {
        const seleccionadas = this.enfermedadesSeleccionadas();
        const term = this.enfermedadSearchTerm().toLowerCase();
        return this.enfermedadesDisponibles().filter(e =>
            !seleccionadas.includes(e.nombre) &&
            e.nombre.toLowerCase().includes(term)
        );
    });

    // Alergias
    alergiasDisponibles = [
        'Penicilina', 'Sulfa', 'Aspirina', 'Latex', 'Polen',
        'Ácaros', 'Gatos', 'Perros', 'Mariscos', 'Nueces',
        'Huevo', 'Leche', 'Trigo', 'Picadura de abeja', 'Ibuprofeno'
    ];
    alergiasSeleccionadas = signal<string[]>([]);
    filteredAlergias = computed(() => {
        const seleccionadas = this.alergiasSeleccionadas();
        const term = this.alergiaSearchTerm.toLowerCase();
        return this.alergiasDisponibles.filter(a =>
            !seleccionadas.includes(a) &&
            a.toLowerCase().includes(term)
        );
    });

    // UI state for chips input
    showEnfermedadesDropdown = false;
    enfermedadSearchTerm = signal('');

    showAlergiasDropdown = false;
    alergiaSearchTerm = '';

    // UI state for Antecedentes
    showAntecedentesDropdown = false;
    antecedentesSearchTerm = signal('');
    antecedentesSeleccionados = signal<string[]>([]);
    filteredAntecedentes = computed(() => {
        const seleccionadas = this.antecedentesSeleccionados();
        const term = this.antecedentesSearchTerm().toLowerCase();
        return this.enfermedadesDisponibles().filter(e =>
            !seleccionadas.includes(e.nombre) &&
            e.nombre.toLowerCase().includes(term)
        );
    });

    // Modal state
    showModal = signal(false);
    modalMode: 'create' | 'edit' = 'create';
    selectedPaciente: Paciente | null = null;

    // Form fields
    formNombre = '';
    formCedula = '';
    formEdad: number | null = null;
    formGenero = '';
    formTipoSangre = '';
    formAlergias = ''; // Not used directly anymore, derived from chips
    formAntecedentes = '';
    formOcupacion = '';
    // formEnfermedadCronica removed as string, now derived from enfermedadesSeleccionadas
    formLoading = false;
    formError = '';
    formSuccess = '';

    // Search result for existing patient
    existingPatient: Paciente | null = null;
    searchingCedula = false;

    generos = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];

    constructor(
        private auth: AuthService,
        private pacienteService: PacienteService
    ) { }

    ngOnInit() {
        this.loadPacientes();
        this.loadEnfermedadesCronicas();
    }

    loadEnfermedadesCronicas() {
        this.pacienteService.getEnfermedadesCronicas().subscribe({
            next: (data) => {
                const diseases = [...data];
                const commons = [
                    'Hipertensión arterial',
                    'Diabetes Tipo 1',
                    'Diabetes Tipo 2',
                    'Asma',
                    'EPOC (Enfermedad Pulmonar Obstructiva Crónica)',
                    'Artritis reumatoide',
                    'Artrosis',
                    'Alzheimer',
                    'Párkinson',
                    'Esclerosis múltiple',
                    'Lupus eritematoso sistémico',
                    'Insuficiencia cardíaca',
                    'Insuficiencia renal crónica',
                    'Hipotiroidismo e hipertiroidismo',
                    'VIH/Sida',
                    'Fibrosis quística',
                    'Epilepsia',
                    'Enfermedad de Crohn',
                    'Colitis ulcerosa',
                    'Psoriasis',
                    'Osteoporosis',
                    'Endometriosis',
                    'Fibromialgia',
                    'Anemia falciforme',
                    'Glaucoma',
                    'Apnea del sueño',
                    'Hepatitis C',
                    'Enfermedad celíaca',
                    'Narcolepsia',
                    'Distrofia muscular',
                    'Esclerosis lateral amiotrófica (ELA)',
                    'Síndrome de fatiga crónica',
                    'Enfermedad de Huntington',
                    'Hipopituitarismo',
                    'Enfermedad de Lyme crónica',
                    'Espondilitis anquilosante',
                    'Sarcoidosis',
                    'Neuropatía periférica',
                    'Insuficiencia venosa crónica',
                    'Aneurisma de aorta abdominal'
                ];

                commons.forEach(name => {
                    if (!diseases.find(d => d.nombre.toLowerCase() === name.toLowerCase())) {
                        diseases.push({ id: 0, nombre: name });
                    }
                });

                // Sort alphabetically
                diseases.sort((a, b) => a.nombre.localeCompare(b.nombre));

                this.enfermedadesDisponibles.set(diseases);
            },
            error: () => {
                console.error('Error al cargar enfermedades crónicas');
                const commons = [
                    'Hipertensión arterial',
                    'Diabetes Tipo 1',
                    'Diabetes Tipo 2',
                    'Asma',
                    'EPOC (Enfermedad Pulmonar Obstructiva Crónica)',
                    'Artritis reumatoide',
                    'Artrosis',
                    'Alzheimer',
                    'Párkinson',
                    'Esclerosis múltiple',
                    'Lupus eritematoso sistémico',
                    'Insuficiencia cardíaca',
                    'Insuficiencia renal crónica',
                    'Hipotiroidismo e hipertiroidismo',
                    'VIH/Sida',
                    'Fibrosis quística',
                    'Epilepsia',
                    'Enfermedad de Crohn',
                    'Colitis ulcerosa',
                    'Psoriasis',
                    'Osteoporosis',
                    'Endometriosis',
                    'Fibromialgia',
                    'Anemia falciforme',
                    'Glaucoma',
                    'Apnea del sueño',
                    'Hepatitis C',
                    'Enfermedad celíaca',
                    'Narcolepsia',
                    'Distrofia muscular',
                    'Esclerosis lateral amiotrófica (ELA)',
                    'Síndrome de fatiga crónica',
                    'Enfermedad de Huntington',
                    'Hipopituitarismo',
                    'Enfermedad de Lyme crónica',
                    'Espondilitis anquilosante',
                    'Sarcoidosis',
                    'Neuropatía periférica',
                    'Insuficiencia venosa crónica',
                    'Aneurisma de aorta abdominal'
                ];
                const diseases = commons.map(name => ({ id: 0, nombre: name }));
                diseases.sort((a, b) => a.nombre.localeCompare(b.nombre));
                this.enfermedadesDisponibles.set(diseases);
            }
        });
    }

    loadPacientes() {
        const userId = this.auth.getUserId();
        if (!userId) {
            this.loading.set(false);
            return;
        }

        this.pacienteService.getPacientesPorUsuario(userId).subscribe({
            next: (data) => {
                this.pacientes.set(data);
                this.filteredPacientes.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.pacientes.set([]);
                this.filteredPacientes.set([]);
                this.loading.set(false);
            },
        });
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredPacientes.set(this.pacientes());
            return;
        }

        const filtered = this.pacientes().filter((p) =>
        (p.nombreEncriptado?.toLowerCase().includes(term) ||
            p.cedula?.toLowerCase().includes(term) ||
            p.enfermedadCronica?.toLowerCase().includes(term))
        );
        this.filteredPacientes.set(filtered);
    }

    // Enfermedades logic
    addEnfermedad(nombre: string) {
        if (!nombre) return;
        const current = this.enfermedadesSeleccionadas();
        if (!current.includes(nombre)) {
            this.enfermedadesSeleccionadas.set([...current, nombre]);
        }
        this.enfermedadSearchTerm.set('');
        this.showEnfermedadesDropdown = false;
    }

    removeEnfermedad(nombre: string) {
        const current = this.enfermedadesSeleccionadas();
        this.enfermedadesSeleccionadas.set(current.filter(e => e !== nombre));
    }

    toggleEnfermedadesDropdown() {
        // close if disabled
        if (this.existingPatient) return;
        this.showEnfermedadesDropdown = !this.showEnfermedadesDropdown;
    }

    addAlergia(nombre: string) {
        if (!nombre) return;
        const current = this.alergiasSeleccionadas();
        if (!current.includes(nombre)) {
            this.alergiasSeleccionadas.set([...current, nombre]);
        }
        this.alergiaSearchTerm = '';
        this.showAlergiasDropdown = false;
    }

    removeAlergia(nombre: string) {
        const current = this.alergiasSeleccionadas();
        this.alergiasSeleccionadas.set(current.filter(e => e !== nombre));
    }

    // Antecedentes logic
    addAntecedente(nombre: string) {
        if (!nombre) return;
        const current = this.antecedentesSeleccionados();
        if (!current.includes(nombre)) {
            this.antecedentesSeleccionados.set([...current, nombre]);
        }
        this.antecedentesSearchTerm.set('');
        this.showAntecedentesDropdown = false;
    }

    removeAntecedente(nombre: string) {
        const current = this.antecedentesSeleccionados();
        this.antecedentesSeleccionados.set(current.filter(e => e !== nombre));
    }

    toggleAntecedentesDropdown() {
        if (this.existingPatient) return;
        this.showAntecedentesDropdown = !this.showAntecedentesDropdown;
    }

    openCreateModal() {
        this.modalMode = 'create';
        this.selectedPaciente = null;
        this.existingPatient = null;
        this.resetForm();
        this.showModal.set(true);
    }

    openEditModal(paciente: Paciente) {
        this.modalMode = 'edit';
        this.selectedPaciente = paciente;
        this.existingPatient = null;
        this.formNombre = paciente.nombreEncriptado || '';
        this.formCedula = paciente.cedula || '';
        this.formEdad = paciente.edad || null;
        this.formGenero = paciente.genero || '';
        this.formTipoSangre = paciente.tipoSangre || '';
        this.formAlergias = paciente.alergias || '';
        this.formAntecedentes = paciente.antecedentesFamiliares || '';
        this.formOcupacion = paciente.ocupacion || '';

        // Parse comma-separated string to array
        if (paciente.enfermedadCronica) {
            this.enfermedadesSeleccionadas.set(
                paciente.enfermedadCronica.split(',').map(s => s.trim()).filter(s => s.length > 0)
            );
        } else {
            this.enfermedadesSeleccionadas.set([]);
        }

        if (paciente.alergias) {
            this.alergiasSeleccionadas.set(
                paciente.alergias.split(',').map(s => s.trim()).filter(s => s.length > 0)
            );
        } else {
            this.alergiasSeleccionadas.set([]);
        }

        if (paciente.antecedentesFamiliares) {
            this.antecedentesSeleccionados.set(
                paciente.antecedentesFamiliares.split(',').map(s => s.trim()).filter(s => s.length > 0)
            );
        } else {
            this.antecedentesSeleccionados.set([]);
        }

        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
        this.resetForm();
    }

    resetForm() {
        this.formNombre = '';
        this.formCedula = '';
        this.formEdad = null;
        this.formGenero = '';
        this.formTipoSangre = '';
        this.formAlergias = '';
        this.formAntecedentes = '';
        this.formOcupacion = '';
        this.formOcupacion = '';
        this.enfermedadesSeleccionadas.set([]);
        this.enfermedadSearchTerm.set('');
        this.showEnfermedadesDropdown = false;
        this.alergiasSeleccionadas.set([]);
        this.alergiaSearchTerm = '';
        this.showAlergiasDropdown = false;
        this.antecedentesSeleccionados.set([]);
        this.antecedentesSearchTerm.set('');
        this.showAntecedentesDropdown = false;
        this.formError = '';
        this.formSuccess = '';
        this.existingPatient = null;
    }

    /**
     * Busca un paciente por cédula cuando el usuario termina de escribir
     */
    onCedulaBlur() {
        if (this.modalMode !== 'create' || !this.formCedula || this.formCedula.length < 5) {
            return;
        }

        if (!isValidCedula(this.formCedula)) {
            this.formError = 'La cédula ingresada no es válida.';
            return;
        }

        // First check if patient is already in the doctor's list
        const alreadyAssociated = this.pacientes().find(p => p.cedula === this.formCedula);
        if (alreadyAssociated) {
            this.formError = 'Este paciente ya está asociado a su cuenta.';
            this.existingPatient = null;
            return;
        }

        this.formError = '';
        this.searchingCedula = true;
        this.pacienteService.buscarPorCedula(this.formCedula).subscribe({
            next: (paciente) => {
                this.searchingCedula = false;
                if (paciente && paciente.id) {
                    this.existingPatient = paciente;
                    // Auto-fill form with existing patient data
                    this.formNombre = paciente.nombreEncriptado || '';
                    this.formEdad = paciente.edad || null;
                    this.formGenero = paciente.genero || '';
                    this.formTipoSangre = paciente.tipoSangre || '';
                    this.formAlergias = paciente.alergias || '';
                    this.formAntecedentes = paciente.antecedentesFamiliares || '';
                    this.formOcupacion = paciente.ocupacion || '';
                    if (paciente.enfermedadCronica) {
                        this.enfermedadesSeleccionadas.set(
                            paciente.enfermedadCronica.split(',').map(s => s.trim()).filter(s => s.length > 0)
                        );
                    } else {
                        this.enfermedadesSeleccionadas.set([]);
                    }
                    if (paciente.alergias) {
                        this.alergiasSeleccionadas.set(
                            paciente.alergias.split(',').map(s => s.trim()).filter(s => s.length > 0)
                        );
                    } else {
                        this.alergiasSeleccionadas.set([]);
                    }
                    if (paciente.antecedentesFamiliares) {
                        this.antecedentesSeleccionados.set(
                            paciente.antecedentesFamiliares.split(',').map(s => s.trim()).filter(s => s.length > 0)
                        );
                    } else {
                        this.antecedentesSeleccionados.set([]);
                    }
                } else {
                    this.existingPatient = null;
                }
            },
            error: () => {
                this.searchingCedula = false;
                this.existingPatient = null;
            },
        });
    }

    onSubmitForm() {
        if (!this.formNombre || !this.formCedula) {
            this.formError = 'Nombre y cédula son obligatorios.';
            return;
        }

        if (!isValidCedula(this.formCedula)) {
            this.formError = 'La cédula debe tener exactamente 10 dígitos numéricos.';
            return;
        }

        if (!isValidNombreCompleto(this.formNombre)) {
            this.formError = 'El nombre solo puede contener letras y espacios, sin números ni símbolos.';
            return;
        }

        if (this.enfermedadesSeleccionadas().length === 0) {
            this.formError = 'Debe seleccionar al menos una enfermedad crónica.';
            return;
        }

        const userId = this.auth.getUserId();
        if (!userId) {
            this.formError = 'Error de autenticación.';
            return;
        }

        this.formLoading = true;
        this.formError = '';

        const enfermedadCronicaStr = this.enfermedadesSeleccionadas().join(', ');
        const alergiasStr = this.alergiasSeleccionadas().join(', ');
        const antecedentesStr = this.antecedentesSeleccionados().join(', ');

        // If editing, just update
        if (this.modalMode === 'edit' && this.selectedPaciente?.id) {
            const paciente: Paciente = {
                id: this.selectedPaciente.id,
                nombreEncriptado: this.formNombre,
                cedula: this.formCedula,
                edad: this.formEdad || undefined,
                genero: this.formGenero || undefined,
                tipoSangre: this.formTipoSangre || undefined,
                alergias: alergiasStr || undefined,
                antecedentesFamiliares: antecedentesStr || undefined,
                ocupacion: this.formOcupacion || undefined,
                enfermedadCronica: enfermedadCronicaStr || undefined,
                activo: true,
            };

            this.pacienteService.updatePaciente(this.selectedPaciente.id, paciente).subscribe({
                next: () => {
                    this.formLoading = false;
                    this.formSuccess = 'Paciente actualizado.';
                    setTimeout(() => {
                        this.closeModal();
                        this.loadPacientes();
                    }, 1000);
                },
                error: () => {
                    this.formLoading = false;
                    this.formError = 'Error al actualizar. Intente nuevamente.';
                },
            });
            return;
        }

        // If creating and patient already exists, just associate
        if (this.existingPatient && this.existingPatient.id) {
            this.pacienteService.asociarPaciente(this.existingPatient.id, userId).subscribe({
                next: () => {
                    this.formLoading = false;
                    this.formSuccess = 'Paciente asociado exitosamente a su cuenta.';
                    setTimeout(() => {
                        this.closeModal();
                        this.loadPacientes();
                    }, 1000);
                },
                error: (err) => {
                    this.formLoading = false;
                    if (err?.status === 409) {
                        this.formError = 'Este paciente ya está asociado a su cuenta.';
                    } else {
                        this.formError = 'Error al asociar. Intente nuevamente.';
                    }
                },
            });
            return;
        }

        // Create new patient
        const paciente: Paciente = {
            nombreEncriptado: this.formNombre,
            cedula: this.formCedula,
            edad: this.formEdad || undefined,
            genero: this.formGenero || undefined,
            tipoSangre: this.formTipoSangre || undefined,
            alergias: alergiasStr || undefined,
            antecedentesFamiliares: this.formAntecedentes || undefined,
            ocupacion: this.formOcupacion || undefined,
            enfermedadCronica: enfermedadCronicaStr || undefined,
            activo: true,
        };

        this.pacienteService.createPaciente(paciente, userId).subscribe({
            next: () => {
                this.formLoading = false;
                this.formSuccess = 'Paciente registrado exitosamente.';
                setTimeout(() => {
                    this.closeModal();
                    this.loadPacientes();
                }, 1000);
            },
            error: (err) => {
                this.formLoading = false;
                if (err?.status === 409) {
                    this.formError = 'Ya existe un paciente con esta cédula.';
                } else {
                    this.formError = 'Error al guardar. Intente nuevamente.';
                }
            },
        });
    }

    desasociarPaciente(paciente: Paciente) {
        if (!paciente.id) return;
        if (!confirm(`¿Está seguro de desasociar a ${paciente.nombreEncriptado || 'este paciente'} de su cuenta?`)) return;

        const userId = this.auth.getUserId();
        if (!userId) return;

        this.pacienteService.desasociarPaciente(paciente.id, userId).subscribe({
            next: () => {
                this.loadPacientes();
            },
            error: () => {
                alert('Error al desasociar el paciente.');
            },
        });
    }

    /**
     * Solo permite números en el campo de cédula
     */
    onCedulaKeyPress(event: KeyboardEvent): boolean {
        const charCode = event.key.charCodeAt(0);
        // Solo permite dígitos (0-9)
        if (event.key.length === 1 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    /**
     * Solo permite letras y espacios en el campo de nombre
     */
    onNombreKeyPress(event: KeyboardEvent): boolean {
        const char = event.key;
        // Permite letras (incluyendo acentos), espacios y teclas de control
        const letraRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
        if (char.length === 1 && !letraRegex.test(char)) {
            event.preventDefault();
            return false;
        }
        return true;
    }
}
