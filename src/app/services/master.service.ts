import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ContactInfo, ContactForm } from '../pages/get-in-touch/get-in-touch.component';
import { projects } from '../pages/projects/projects.component';
import { Skill } from '../pages/skills/skills.component';

export interface PortfolioData {
  role: string
  name: string
  description: string
  skills: Skill[]
  projects: projects[]
  ContactInfo: ContactInfo[]
  whyWorkWithMe: string[],
  gitHubProfileLink: string,
  linkdinProfileLink: string,
  mailId: string
}

@Injectable({
  providedIn: 'root'
})
export class MasterService {


  // private url = 'http://localhost:3000'; //local
  private url = 'https://new-portfolio-mean-stack.onrender.com/'; // #production


  private baseUrl = this.url;

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
    mailId: ''
  });
  allPortfolioData = this.allPortfolioData$.asObservable();

  constructor(private http: HttpClient) { }

  getAllProtfolioData() {
    this.http.get<PortfolioData>(`${this.baseUrl}/api/portfolio/getAllPortfolioData`).subscribe((data: PortfolioData) => {
      const res = Array.isArray(data) ? data[0] : data;
      this.allPortfolioData$.next(res);
    });
  };

  submitContactForm(contactForm: ContactForm): Observable<ContactForm> {
    return this.http.post<ContactForm>(`${this.baseUrl}/api/contact/saveContactForm`, contactForm);
  }
}
