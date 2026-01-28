import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Your Profile</h3>
              <div *ngIf="user; else notSignedIn" class="row mt-4">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h5 class="card-title">Account Information</h5>
                      <p class="card-text"><strong>Email:</strong> {{ user.email }}</p>
                      <p class="card-text"><strong>Role:</strong> {{ user.role }}</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h5 class="card-title">Quick Actions</h5>
                      <a routerLink="/dashboard" class="btn btn-primary me-2">Go to Dashboard</a>
                      <a routerLink="/transports" class="btn btn-secondary me-2">View Transports</a>
                      <!-- Navigate to transports and request modal open for the row matching user's email -->
                      <a [routerLink]="['/transports']" [queryParams]="{ editByEmail: user && user.email }" class="btn btn-outline-primary">Edit my transport</a>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #notSignedIn>
                <div class="alert alert-warning">
                  <h4 class="alert-heading">Not Signed In</h4>
                  <p>Please sign in to view your profile.</p>
                  <a routerLink="/login" class="btn btn-primary">Sign In</a>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
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
