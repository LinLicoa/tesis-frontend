import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  loading = false;
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {
    // Si ya está autenticado, redirigir al dashboard
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Por favor complete todos los campos.';
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const status = err?.status;
        if (status === 401) {
          this.errorMsg = 'Credenciales incorrectas. Verifique su email y contraseña.';
        } else if (status === 0) {
          this.errorMsg = 'No se pudo conectar con el servidor.';
        } else {
          this.errorMsg = 'Error al iniciar sesión. Intente nuevamente.';
        }
      },
    });
  }
}