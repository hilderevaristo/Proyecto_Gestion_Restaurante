import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardData } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';


@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private adminService = inject(AdminService);
  auth = inject(AuthService);

  data = signal<DashboardData | null>(null);
  cargando = signal(true);

  ngOnInit() {
    this.adminService.getDashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        this.cargando.set(false);
      },
      error: (e) => {
        console.error(e);
        this.cargando.set(false);
      }
    });
  }

  getBadgeClass(estado: string | undefined): string {
    if (!estado) return 'bg-secondary';
    switch (estado.toUpperCase()) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'COMPLETADO': return 'bg-success';
      case 'CANCELADO': return 'bg-danger';
      case 'PROCESANDO': return 'bg-info text-dark';
      case 'ENVIADO': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }
}
