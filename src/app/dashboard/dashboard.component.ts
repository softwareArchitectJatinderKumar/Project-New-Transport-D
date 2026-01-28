import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card">
      <h3>Dashboard</h3>
      <p class="muted">Overview and quick stats will appear here.</p>
      <a routerLink="/transports" class="btn">Open Transports</a>
    </div>
  `,
  styles: [``]
})
export class DashboardComponent {}
