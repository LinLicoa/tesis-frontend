import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
    selector: 'app-perfil',
    imports: [CommonModule, FormsModule, SidebarComponent],
    templateUrl: './perfil.html',
    styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
    currentUser = signal<Usuario | null>(null);
    loading = signal(true);

    // Modal de cambio de contraseña
    showPasswordModal = signal(false);
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordLoading = false;
    passwordError = '';
    passwordSuccess = '';

    constructor(
        private auth: AuthService,
        private usuarioService: UsuarioService
    ) {
        // Initialize with cached data first
        this.currentUser.set(this.auth.currentUser());
    }

    ngOnInit() {
        this.loadUserProfile();
    }

    loadUserProfile() {
        const userId = this.auth.getUserId();
        if (userId) {
            this.usuarioService.getUsuario(userId).subscribe({
                next: (user) => {
                    this.currentUser.set(user);
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Error loading user profile', err);
                    this.loading.set(false);
                    // Fallback to auth service data is already there
                }
            });
        } else {
            this.loading.set(false);
        }
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return 'No disponible';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    // Modal de cambio de contraseña
    openPasswordModal() {
        this.resetPasswordForm();
        this.showPasswordModal.set(true);
    }

    closePasswordModal() {
        this.showPasswordModal.set(false);
        this.resetPasswordForm();
    }

    resetPasswordForm() {
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordError = '';
        this.passwordSuccess = '';
        this.passwordLoading = false;
    }

    onChangePassword() {
        this.passwordError = '';
        this.passwordSuccess = '';

        // Validaciones
        if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
            this.passwordError = 'Todos los campos son obligatorios.';
            return;
        }

        if (this.newPassword.length < 6) {
            this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres.';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.passwordError = 'Las contraseñas nuevas no coinciden.';
            return;
        }

        if (this.currentPassword === this.newPassword) {
            this.passwordError = 'La nueva contraseña debe ser diferente a la actual.';
            return;
        }

        this.passwordLoading = true;

        this.auth.changePassword({
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
        }).subscribe({
            next: () => {
                this.passwordLoading = false;
                this.passwordSuccess = 'Contraseña actualizada correctamente.';
                setTimeout(() => {
                    this.closePasswordModal();
                }, 1500);
            },
            error: (err) => {
                this.passwordLoading = false;
                if (err?.status === 400) {
                    this.passwordError = err?.error?.error || 'La contraseña actual es incorrecta.';
                } else {
                    this.passwordError = 'Error al cambiar la contraseña. Intente nuevamente.';
                }
            }
        });
    }
}
