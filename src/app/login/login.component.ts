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
  username = '';
  password = '';
  role = 'user';

  roles = ['user', 'admin'];

  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  reset() {
    this.username = '';
    this.password = '';
    this.role = 'user';
    this.error = null;
  }

  login() {
    // basic client-side check — in real apps verify on server
    if (!this.username || !this.password) {
      this.error = 'Please provide username and password';
      return;
    }
    this.auth.login(this.username, this.role);
    this.router.navigate(['/transports']);
  }
}
