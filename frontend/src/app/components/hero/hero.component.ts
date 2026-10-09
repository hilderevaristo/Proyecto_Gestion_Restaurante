import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  standalone: true,
  selector: 'app-hero',
  styleUrl: './hero.component.css',
  templateUrl: './hero.component.html',
})
export class HeroComponent {}
