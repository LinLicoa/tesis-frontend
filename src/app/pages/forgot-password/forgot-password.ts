import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isValidEmail } from '../../utils/validators';

@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
    email = '';
    loading = false;
    successMsg = '';
    errorMsg = '';

    constructor(private auth: AuthService, private router: Router) { }

    onSubmit() {
        if (!this.email) return;

        if (!isValidEmail(this.email)) {
            this.errorMsg = 'Por favor ingrese un correo válido.';
            return;
        }

        this.loading = true;
        this.errorMsg = '';
        this.successMsg = '';

        this.auth.forgotPassword(this.email).subscribe({
            next: () => {
                this.loading = false;
                this.successMsg = 'Si el correo existe, se ha enviado un código de verificación.';

                // Redirigir a reset-password pasando el email
                setTimeout(() => {
                    this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
                }, 2000);
            },
            error: () => {
                this.loading = false;
                // For security, usually we don't say if email exists or not, but for this demo:
                this.errorMsg = 'No pudimos procesar su solicitud. Intente nuevamente.';
            }
        });
    }
}
