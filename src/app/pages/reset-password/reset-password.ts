import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ResetPasswordRequest } from '../../models/models';

@Component({
    selector: 'app-reset-password',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
    email = '';
    otp = '';
    password = '';
    confirmPassword = '';
    showPassword = false;

    step: 1 | 2 = 1; // 1: Validate OTP, 2: Set New Password
    loading = false;
    successMsg = '';
    errorMsg = '';
    otpValidMsg = '';

    constructor(
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['email']) {
                this.email = params['email'];
            }
        });
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    validateOtp() {
        if (!this.otp || !this.email) {
            this.errorMsg = 'Ingrese el código de verificación.';
            return;
        }

        this.loading = true;
        this.errorMsg = '';
        this.otpValidMsg = '';

        this.auth.validateOtp(this.email, this.otp).subscribe({
            next: () => {
                this.loading = false;
                this.step = 2;
                this.otpValidMsg = 'Código validado correctamente.';
            },
            error: () => {
                this.loading = false;
                this.errorMsg = 'El código es inválido o ha expirado.';
            }
        });
    }

    onSubmit() {
        if (!this.password || !this.confirmPassword) {
            this.errorMsg = 'Complete todos los campos.';
            return;
        }

        if (this.password.length < 6) {
            this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMsg = 'Las contraseñas no coinciden.';
            return;
        }

        this.loading = true;
        this.errorMsg = '';
        this.successMsg = '';

        const payload: ResetPasswordRequest = {
            email: this.email,
            otp: this.otp,
            newPassword: this.password
        };

        this.auth.resetPassword(payload).subscribe({
            next: () => {
                this.loading = false;
                this.successMsg = '¡Contraseña restablecida con éxito!';
            },
            error: () => {
                this.loading = false;
                this.errorMsg = 'No se pudo restablecer la contraseña. Intente nuevamente.';
            }
        });
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
