import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// Components
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { InicioComponent } from './pages/inicio/inicio';
import { PacientesComponent } from './pages/pacientes/pacientes';
import { ConsultasComponent } from './pages/consultas/consultas';
import { NuevaConsultaComponent } from './pages/nueva-consulta/nueva-consulta';
import { PerfilComponent } from './pages/perfil/perfil';
import { ConfiguracionComponent } from './pages/configuracion/configuracion';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';
import { EvaluacionDetalleComponent } from './pages/evaluacion-detalle/evaluacion-detalle';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Protected routes (all authenticated users)
  { path: 'dashboard', component: InicioComponent, canActivate: [authGuard] },
  { path: 'inicio', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'pacientes', component: PacientesComponent, canActivate: [authGuard] },
  { path: 'consultas', component: ConsultasComponent, canActivate: [authGuard] },
  { path: 'nueva-consulta', component: NuevaConsultaComponent, canActivate: [authGuard] },
  { path: 'nueva-consulta/:pacienteId', component: NuevaConsultaComponent, canActivate: [authGuard] },
  { path: 'evaluacion/:id', component: EvaluacionDetalleComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },

  // Admin-only routes
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [adminGuard] },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
