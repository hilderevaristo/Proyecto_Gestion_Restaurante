import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [
    RouterOutlet,
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CarritoComponent,
    CheckoutComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: '/' }
  );

  sinNavbar(): boolean {
    const u = this.url();
    return u.startsWith('/login')
        || u.startsWith('/registro')
        || u.startsWith('/admin');
  }

  esPublico(): boolean {
    return !this.url().startsWith('/admin');
  }
}