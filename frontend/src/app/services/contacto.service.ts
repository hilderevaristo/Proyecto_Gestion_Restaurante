import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contacto } from '../models/contacto';

export interface ContactoResponse {
  success: boolean;
  message?: string;
}

@Service()
export class ContactoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/contacto';

  enviar(data: Contacto): Observable<ContactoResponse> {
    return this.http.post<ContactoResponse>(this.apiUrl, data);
  }
}
