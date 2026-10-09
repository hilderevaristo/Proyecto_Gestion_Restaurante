import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonio {
  texto: string;
  nombre: string;
  usuario: string;
  estrellas: number; // 0-5
}

@Component({
  imports: [CommonModule],
  standalone: true,
  selector: 'app-testimonios',
  styleUrl: './testimonios.component.css',
  templateUrl: './testimonios.component.html',
})
export class TestimoniosComponent {
  testimonios: Testimonio[] = [
    { texto: 'El mejor pollo a la brasa que he probado en Lima. La crocancía de la piel es incomparable. Siempre pido el combo familiar para mi familia.', nombre: 'Maria García', usuario: '@mariagarcia', estrellas: 5 },
    { texto: 'La chicha morada acompaña perfectamente el pollo. Me encanta la rapidez del delivery y la presentación de los combos. Mi pollería favorita.', nombre: 'Ana Torres', usuario: '@anatorres_pe', estrellas: 5 },
    { texto: 'Como chef profesional, valoro la calidad del pollo. La marinada y el punto de cocción son perfectos. Las ensaladas son frescas y bien preparadas.', nombre: 'Patricia Flores', usuario: '@pflores_chef', estrellas: 5 },
    { texto: 'Increíble sabor y atención. El pollo está perfectamente sazonado y las papas son las más crujientes de la ciudad. ¡100% recomendado!', nombre: 'Carlos Mendoza', usuario: '@cmedroza80', estrellas: 5 },
    { texto: 'Ordenamos para reunirnos de empresa y siempre quedamos satisfechos. El Mega Combo es ideal para grupos grandes. Excelente servicio corporativo.', nombre: 'Jorge Huamán', usuario: '@jorgeh_corp', estrellas: 5 },
    { texto: 'Próximamente lanzaremos nuevos platos. Estamos emocionados de compartir las novedades con todos nuestros clientes.', nombre: 'Luis Ramírez', usuario: '@lusrramirez_dev', estrellas: 4 }
  ];
}
