import { Injectable } from '@angular/core';

export interface UserToken {
username: any;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'transport_app_user';

  login(email: string, role: string) {
    const token: UserToken = {
      email, role,
      username: undefined
    };
    localStorage.setItem(this.storageKey, JSON.stringify(token));
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  getUser(): UserToken | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserToken;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }
}
