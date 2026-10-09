import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AdminLayoutComponent } from './pages/admin/layout/admin-layout.component';
import { adminGuard } from './guards/admin-guard';
import { AdminUsuariosComponent } from './pages/admin/usuarios/admin-usuarios.component';
import { AdminProductosComponent } from './pages/admin/productos/admin-productos.component';
import { AdminPedidosComponent } from './pages/admin/pedidos/admin-pedidos.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: AdminUsuariosComponent },
      { path: 'productos', component: AdminProductosComponent },
      { path: 'pedidos', component: AdminPedidosComponent } 
    ]
  },
  { path: '**', redirectTo: '' },
];
