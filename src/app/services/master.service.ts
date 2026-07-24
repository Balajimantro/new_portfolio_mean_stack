import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  }
}

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private baseUrl = API_BASE_URL;

  private allPortfolioData$ = new BehaviorSubject<PortfolioData>({
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
  });
  allPortfolioData = this.allPortfolioData$.asObservable();

  constructor(private http: HttpClient) {}

  getAllProtfolioData(): void {
    this.http.get<PortfolioData>(`${this.baseUrl}/api/portfolio/getAllPortfolioData`).subscribe((data: PortfolioData) => {
      const res = Array.isArray(data) ? data[0] : data;
      this.allPortfolioData$.next(res);
    });
  }

  submitContactForm(contactForm: ContactForm): Observable<ContactForm> {
    return this.http.post<ContactForm>(`${this.baseUrl}/api/contact/saveContactForm`, contactForm);
  }
}
