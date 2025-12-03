import { Injectable } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DownloadUtil {

  constructor(private snackBar: MatSnackBar) {}

  handleDownload(obs: Observable<HttpResponse<Blob>>): void {
    obs.subscribe({
      next: (response) => {
        const blob = response.body!;
        const fileName = this.extractFilename(response.headers) || 'download.pdf';

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      },
      error: (err) => {
        if (err.status === 404) {
          this.snackBar.open('File non trovato', 'Chiudi', { duration: 3000 });
        } else {
          this.snackBar.open('Errore durante il download', 'Chiudi', { duration: 3000 });
        }
      }
    });
  }

  private extractFilename(headers: HttpHeaders): string | null {
    const cd = headers.get('Content-Disposition');
    const match = /filename="?([^"]+)"?/.exec(cd ?? '');
    return match ? match[1] : null;
  }
}
