import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserToken } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  currentUser: UserToken | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.getUser(); // to initialize if any
    this.updateUser();
  }

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  logout(): void {
    const ok = confirm('Are you sure you want to logout?');
    if (ok) {
      this.auth.logout();
      this.updateUser();
      this.router.navigate(['/login']);
    }
  }

  private updateUser(): void {
    this.currentUser = this.auth.getUser();
  }
}
