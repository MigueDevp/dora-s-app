import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  username: string;
  name: string;
  avatar?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated: Observable<boolean>;

  // Usuarios de ejemplo (en producción esto vendría de una API)
  private validUsers = [
    { username: 'admin', password: 'admin123', name: 'Administrador', avatar: '👨‍💼' },
    { username: 'usuario', password: 'user123', name: 'Usuario Regular', avatar: '👤' },
    { username: 'invitado', password: 'guest123', name: 'Usuario Invitado', avatar: '👋' }
  ];

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!storedUser);
    this.isAuthenticated = this.isAuthenticatedSubject.asObservable();
  }

  login(loginData: LoginData): { success: boolean; message: string; user?: User } {
    const user = this.validUsers.find(
      u => u.username === loginData.username && u.password === loginData.password
    );

    if (user) {
      const userInfo: User = {
        username: user.username,
        name: user.name,
        avatar: user.avatar
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      localStorage.setItem('token', this.generateToken());
      this.currentUserSubject.next(userInfo);
      this.isAuthenticatedSubject.next(true);
      
      return { success: true, message: 'Login exitoso', user: userInfo };
    } else {
      return { success: false, message: 'Credenciales incorrectas' };
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private generateToken(): string {
    return 'mock-jwt-token-' + Math.random().toString(36).substr(2);
  }
}