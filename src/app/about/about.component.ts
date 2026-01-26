import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3>About</h3>
      <p class="muted">This is a starter template integrated into the Transport App project.</p>
    </div>
  `,
  styles: [``]
})
export class AboutComponent {}
