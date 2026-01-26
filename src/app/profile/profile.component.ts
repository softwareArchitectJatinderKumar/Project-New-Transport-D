import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3>Your Profile</h3>
      <p *ngIf="user" class="muted">Email: {{ user.email }} — Role: {{ user.role }}</p>
      <p *ngIf="!user" class="muted">No user signed in.</p>
    </div>
  `,
  styles: [``]
})
export class ProfileComponent {
  constructor(private auth: AuthService) {}
  get user() {
    return this.auth.getUser();
  }
}
