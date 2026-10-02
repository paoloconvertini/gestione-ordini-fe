import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { of } from 'rxjs';
import { AppuntamentoService } from './appuntamento.service';

describe('AppuntamentoService', () => {
  for (const date of [new Date(2026, 9, 2), moment([2026, 9, 2]), '2026-10-02']) {
    it('sends a calendar date on create and update without changing the form', () => {
      const http = jasmine.createSpyObj('HttpClient', ['post', 'put']);
      http.post.and.returnValue(of({}));
      http.put.and.returnValue(of({}));
      const service = new AppuntamentoService(http as HttpClient);
      const dto = { dataAppuntamento: date, oraDa: '09:00', oraA: '10:00' };
      const payload = { ...dto, dataAppuntamento: '2026-10-02' };
      service.create(dto).subscribe();
      service.update(12, dto).subscribe();
      expect(http.post).toHaveBeenCalledWith(jasmine.any(String), payload);
      expect(http.put).toHaveBeenCalledWith(jasmine.any(String), payload);
      expect(dto.dataAppuntamento).toBe(date);
    });
  }
});
