import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProductosComponent } from '../../components/productos/productos.component';
import { NosotrosComponent } from '../../components/nosotros/nosotros.component';
import { TestimoniosComponent } from '../../components/testimonios/testimonios.component';
import { ContactoComponent } from '../../components/contacto/contacto.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    ProductosComponent,
    NosotrosComponent,
    TestimoniosComponent,
    ContactoComponent 
  ],
  template: `
    <app-hero></app-hero>
    <app-productos></app-productos>
    <app-nosotros></app-nosotros>
    <app-testimonios></app-testimonios>
    <app-contacto></app-contacto>
  `
})
export class HomeComponent {}
