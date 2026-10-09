import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

declare var Swal: any;

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.component.css',
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  sidebarAbierto = signal(false);

  // 👇 Referencia al <link> del CSS del admin
  private adminCssLink: HTMLLinkElement | null = null;

  ngOnInit() {
    // Cargar admin.css SOLO cuando entras al panel
    if (!document.getElementById('admin-css')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/admin.css';
      link.id = 'admin-css';
      document.head.appendChild(link);
      this.adminCssLink = link;
    }
  }
   ngOnDestroy() {
    // Quitar admin.css cuando SALES del panel
    const link = document.getElementById('admin-css');
    if (link) {
      link.remove();
    }
    this.adminCssLink = null;
  }

  toggleSidebar() {
    this.sidebarAbierto.update(v => !v);
  }

  cerrarSidebar() {
    this.sidebarAbierto.set(false);
  }

  cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Saldrás del panel de administración',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.auth.logout().subscribe({
          next: () => this.router.navigate(['/']),
          error: () => {
            this.auth.usuarioActual.set(null);
            localStorage.removeItem('usuario');
            this.router.navigate(['/']);
          }
        });
      }
    });
  }
}
