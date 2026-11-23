import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, retry, timeout } from 'rxjs';
import { ContactInfo, ContactForm } from '../pages/get-in-touch/get-in-touch.component';
import { projects } from '../pages/projects/projects.component';
import { Skill } from '../pages/skills/skills.component';
import { API_BASE_URL } from './api.config';

export interface PortfolioData {
  role: string;
  name: string;
  description: string;
  skills: Skill[];
  projects: projects[];
  ContactInfo: ContactInfo[];
  whyWorkWithMe: string[];
  gitHubProfileLink: string;
  linkdinProfileLink: string;
  mailId: string;
  resume?: {
    cvLink: string;
    cvPublicId: string;
    fileName: string;
  };
}

const EMPTY_DATA: PortfolioData = {
  role: '',
  name: '',
  description: '',
  skills: [],
  projects: [],
  ContactInfo: [],
  whyWorkWithMe: [],
  gitHubProfileLink: '',
  linkdinProfileLink: '',
  mailId: '',
  resume: {
    cvLink: '',
    cvPublicId: '',
    fileName: ''
  }
};

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private baseUrl = API_BASE_URL;

  private readonly allPortfolioData$ = new BehaviorSubject<PortfolioData>(EMPTY_DATA);
  readonly allPortfolioData = this.allPortfolioData$.asObservable();

  private readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly loading = this.loading$.asObservable();

  private readonly loadError$ = new BehaviorSubject<boolean>(false);
  readonly loadError = this.loadError$.asObservable();

  constructor(private http: HttpClient) {}

  getAllProtfolioData(): void {
    this.loading$.next(true);
    this.loadError$.next(false);

    this.http
      .get<PortfolioData | PortfolioData[]>(`${this.baseUrl}/api/portfolio/getAllPortfolioData`)
      .pipe(
        timeout(15000),
        retry({ count: 1, delay: 900 }),
        catchError(() => {
          this.loadError$.next(true);
          return of(null);
        })
      )
      .subscribe((data) => {
        if (data) {
          const res = Array.isArray(data) ? data[0] : data;
          this.allPortfolioData$.next({ ...EMPTY_DATA, ...res });
        }
        this.loading$.next(false);
      });
  }

  submitContactForm(contactForm: ContactForm): Observable<ContactForm> {
    return this.http.post<ContactForm>(`${this.baseUrl}/api/contact/saveContactForm`, contactForm);
  }
}
