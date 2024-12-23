import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollPositionService {
  private scrollPosition = 0;

  setScrollPosition(position: number): void {
    this.scrollPosition = position;
  }

  getScrollPosition(): number {
    return this.scrollPosition;
  }
}

