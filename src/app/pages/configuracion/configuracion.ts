import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ParametroSistemaService } from '../../services/parametro-sistema.service';
import { ParametroSistema, TipoDato } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
    selector: 'app-configuracion',
    imports: [CommonModule, FormsModule, SidebarComponent],
    templateUrl: './configuracion.html',
    styleUrl: './configuracion.css',
})
export class ConfiguracionComponent implements OnInit {
    parametros = signal<ParametroSistema[]>([]);
    loading = signal(true);

    // Modal state
    showModal = signal(false);
    modalMode: 'create' | 'edit' = 'create';
    selectedParametro: ParametroSistema | null = null;

    // Form fields
    formClave = '';
    formValor = '';
    formTipoDato: TipoDato = 'STRING';
    formCategoria = '';
    formEditable = true;
    formLoading = false;
    formError = '';
    formSuccess = '';

    tiposDato: TipoDato[] = ['STRING', 'INTEGER', 'BOOLEAN'];
    categorias = ['Seguridad', 'Sistema', 'Notificaciones', 'Evaluaciones', 'General'];

    isAdmin = computed(() => this.auth.isAdmin());

    constructor(
        private auth: AuthService,
        private parametroService: ParametroSistemaService,
        private router: Router
    ) { }

    ngOnInit() {
        // Verify admin role
        if (!this.isAdmin()) {
            this.router.navigate(['/dashboard']);
            return;
        }
        this.loadParametros();
    }

    loadParametros() {
        this.parametroService.getParametros().subscribe({
            next: (data) => {
                this.parametros.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.parametros.set([]);
                this.loading.set(false);
            },
        });
    }

    openCreateModal() {
        this.modalMode = 'create';
        this.selectedParametro = null;
        this.resetForm();
        this.showModal.set(true);
    }

    openEditModal(param: ParametroSistema) {
        this.modalMode = 'edit';
        this.selectedParametro = param;
        this.formClave = param.clave;
        this.formValor = param.valor;
        this.formTipoDato = param.tipoDato;
        this.formCategoria = param.categoria || '';
        this.formEditable = param.editable !== false;
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
        this.resetForm();
    }

    resetForm() {
        this.formClave = '';
        this.formValor = '';
        this.formTipoDato = 'STRING';
        this.formCategoria = '';
        this.formEditable = true;
        this.formError = '';
        this.formSuccess = '';
    }

    onSubmitForm() {
        if (!this.formClave || !this.formValor) {
            this.formError = 'Clave y valor son obligatorios.';
            return;
        }

        this.formLoading = true;
        this.formError = '';

        const parametro: ParametroSistema = {
            id: this.selectedParametro?.id || '',
            clave: this.formClave,
            valor: this.formValor,
            tipoDato: this.formTipoDato,
            categoria: this.formCategoria || undefined,
            editable: this.formEditable,
        };

        const request = this.modalMode === 'edit' && this.selectedParametro?.id
            ? this.parametroService.updateParametro(this.selectedParametro.id, parametro)
            : this.parametroService.createParametro(parametro);

        request.subscribe({
            next: () => {
                this.formLoading = false;
                this.formSuccess = this.modalMode === 'create'
                    ? 'Parámetro creado exitosamente.'
                    : 'Parámetro actualizado.';

                setTimeout(() => {
                    this.closeModal();
                    this.loadParametros();
                }, 1000);
            },
            error: (err) => {
                this.formLoading = false;
                if (err?.status === 409) {
                    this.formError = 'Ya existe un parámetro con esta clave.';
                } else if (err?.status === 403) {
                    this.formError = 'No tiene permisos para realizar esta acción.';
                } else {
                    this.formError = 'Error al guardar. Intente nuevamente.';
                }
            },
        });
    }

    deleteParametro(param: ParametroSistema) {
        if (!param.id) return;
        if (!confirm(`¿Está seguro de eliminar el parámetro "${param.clave}"?`)) return;

        this.parametroService.deleteParametro(param.id).subscribe({
            next: () => {
                this.loadParametros();
            },
            error: () => {
                alert('Error al eliminar el parámetro.');
            },
        });
    }

    getTipoDatoIcon(tipo: TipoDato): string {
        switch (tipo) {
            case 'INTEGER': return '123';
            case 'BOOLEAN': return '✓/✗';
            default: return 'Abc';
        }
    }
}
