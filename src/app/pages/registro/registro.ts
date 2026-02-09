import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/models';
import { isValidEmail, isValidCedula } from '../../utils/validators';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  // Form fields aligned with RegisterRequest DTO
  nombreCompleto = '';
  cedulaProfesional = '';
  especialidad = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  successMsg = '';
  errorMsg = '';
  showPassword = false;

  // Especialidades disponibles
  especialidades = [
    'Psiquiatría',
    'Psicología Clínica',
    'Neurología',
    'Medicina General',
    'Medicina Interna',
    'Otra',
  ];

  constructor(private auth: AuthService, private router: Router) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Validaciones
    if (!this.nombreCompleto || !this.cedulaProfesional || !this.especialidad || !this.email || !this.password) {
      this.errorMsg = 'Por favor complete todos los campos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Validar formato de email
    if (!isValidEmail(this.email)) {
      this.errorMsg = 'Por favor ingrese un correo electrónico válido.';
      return;
    }

    // Validar cédula profesional (si aplica la misma lógica de cédula)
    // Asumimos que "Cédula Profesional" sigue el formato de cédula de identidad para este caso,
    // o al menos requerimos validación básica si fuera diferente.
    // Confirmado por el usuario: validación dígito verificador para TODOS los campos.
    if (!isValidCedula(this.cedulaProfesional)) {
      this.errorMsg = 'La Cédula Profesional ingresada no es válida.';
      return;
    }

    this.successMsg = '';
    this.errorMsg = '';
    this.loading = true;

    const payload: RegisterRequest = {
      nombreCompleto: this.nombreCompleto,
      cedulaProfesional: this.cedulaProfesional,
      especialidad: this.especialidad,
      email: this.email,
      password: this.password,
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = '¡Registro exitoso! Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 409) {
          this.errorMsg = 'Ya existe un usuario con este email o cédula profesional.';
        } else if (err?.status === 400) {
          this.errorMsg = 'Datos inválidos. Verifique la información ingresada.';
        } else {
          this.errorMsg = 'Error al registrar. Intente nuevamente.';
        }
      },
    });
  }
}