import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PacienteService } from '../../services/paciente.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { Paciente, Evaluacion, Usuario } from '../../models/models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent implements OnInit {
  currentUser = signal<Usuario | null>(null);
  pacientes = signal<Paciente[]>([]);
  evaluaciones = signal<Evaluacion[]>([]);
  loading = signal(true);

  // Stats
  totalPacientes = signal(0);
  evaluacionesHoy = signal(0);
  evaluacionesSemana = signal(0);

  constructor(
    private auth: AuthService,
    private pacienteService: PacienteService,
    private evaluacionService: EvaluacionService
  ) { }

  ngOnInit() {
    this.currentUser.set(this.auth.currentUser());
    this.loadData();
  }

  loadData() {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.loading.set(false);
      return;
    }

    // Load pacientes
    this.pacienteService.getPacientesPorUsuario(userId).subscribe({
      next: (data) => {
        this.pacientes.set(data);
        this.totalPacientes.set(data.length);
      },
      error: () => {
        this.pacientes.set([]);
      },
    });

    // Load evaluaciones
    this.evaluacionService.getEvaluacionesPorUsuario(userId).subscribe({
      next: (data) => {
        this.evaluaciones.set(data);
        this.calculateStats(data);
        this.loading.set(false);
      },
      error: () => {
        this.evaluaciones.set([]);
        this.loading.set(false);
      },
    });
  }

  calculateStats(evaluaciones: Evaluacion[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let todayCount = 0;
    let weekCount = 0;

    evaluaciones.forEach((ev) => {
      if (ev.fechaHora) {
        const evDate = new Date(ev.fechaHora);
        evDate.setHours(0, 0, 0, 0);

        if (evDate.getTime() === today.getTime()) {
          todayCount++;
        }
        if (evDate >= weekAgo) {
          weekCount++;
        }
      }
    });

    this.evaluacionesHoy.set(todayCount);
    this.evaluacionesSemana.set(weekCount);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getFirstName(): string {
    const fullName = this.currentUser()?.nombreCompleto;
    if (!fullName) return 'Doctor';
    // Toma solo el primer nombre (primera palabra)
    return fullName.split(' ')[0];
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getNivelClass(nivel?: string): string {
    if (!nivel) return '';
    const lower = nivel.toLowerCase();
    if (lower.includes('leve') || lower.includes('bajo')) return 'level-low';
    if (lower.includes('moderado') || lower.includes('medio')) return 'level-medium';
    if (lower.includes('severo') || lower.includes('alto') || lower.includes('grave')) return 'level-high';
    return '';
  }
}