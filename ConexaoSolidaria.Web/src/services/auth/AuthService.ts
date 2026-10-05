export class AuthService {

isloggedIn(): boolean {
    const token = localStorage.getItem('token');

    return !!token;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

}
