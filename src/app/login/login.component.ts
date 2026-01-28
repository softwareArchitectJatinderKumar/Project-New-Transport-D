import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  role = 'user';

  roles = ['user', 'admin'];

  error: string | null = null;

  private staticEmail = 'admin@transport.com';
  private staticPassword = 'password123';

  constructor(private auth: AuthService, private router: Router) {}

  reset() {
    this.email = '';
    this.password = '';
    this.role = 'user';
    this.error = null;
  }

  login() {
    // basic client-side check — in real apps verify on server
    if (!this.email || !this.password) {
      this.error = 'Please provide email and password';
      return;
    }
    if (this.email !== this.staticEmail || this.password !== this.staticPassword) {
      this.error = 'Invalid email or password';
      return;
    }
    this.auth.login(this.email, this.role);
    // route to dashboard as the app landing page
    this.router.navigate(['/transports']);
  }
}
