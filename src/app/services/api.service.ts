import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private token = '';
  private jwtToken$ = new BehaviorSubject<string>(this.token);
  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient,
              private router: Router,
              private toast: ToastrService) {
    const fetchedToken = localStorage.getItem('act');

    if (fetchedToken) {
      this.token = atob(fetchedToken);
      this.jwtToken$.next(this.token);
    }

  }

  get jwtUserToken(): Observable<string> {
    return this.jwtToken$.asObservable();
  }

  /* Getting All Todos */
  getAllTodos(): Observable<any> {
    return this.http.get(`${this.API_URL}/todos`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }

  login(username: string, password: string) {

    this.http.post(`${this.API_URL}/auth/login`, {username, password})
      // @ts-ignore
      .subscribe((res: { token: string }) => {
        this.token = res.token;

        if (this.token) {
          this.toast.success('Login successful, redirecting now...', '', {
            timeOut: 700,
            positionClass: 'toast-top-center'
          }).onHidden.toPromise().then(() => {
            this.jwtToken$.next(this.token);
            localStorage.setItem('act', btoa(this.token));
            this.router.navigateByUrl('/').then();
          });
        }
      }, (err: HttpErrorResponse) => console.log(err.message));
  }

  // tslint:disable-next-line:typedef
  logout() {
    this.token = '';
    this.jwtToken$.next(this.token);
    this.toast.success('Logged out succesfully', '', {
      timeOut: 500
    }).onHidden.subscribe(() => {
      localStorage.removeItem('act');
      this.router.navigateByUrl('/login').then();
    });
    return '';
  }

  // tslint:disable-next-line:typedef
  createTodo(title: string, description: string) {
    return this.http.post(`${this.API_URL}/todos`, {title, description}, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }

  // tslint:disable-next-line:typedef
  updateStatus(statusValue: string, todoId: number) {
    return this.http.patch(`${this.API_URL}/todos/${todoId}`, {status: statusValue}, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).pipe(
      tap(res => {
        if (res) {
          this.toast.success('Status updated successfully', '', {
            timeOut: 1000
          });
        }
      })
    );
  }

  deleteTodo(todoId: number) {
    return this.http.delete(`${this.API_URL}/todos/${todoId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).pipe(
      tap(res => {
        // @ts-ignore
        if (res.success) {
          this.toast.success('Todo deleted successfully');
        }
      })
    );
}
}
