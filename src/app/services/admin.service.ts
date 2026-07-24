import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Skill } from '../pages/skills/skills.component';
import { projects } from '../pages/projects/projects.component';
import { ContactSubmission } from '../models/contact-submission';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  addSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(`${this.baseUrl}/api/admin/skills`, skill);
  }

  updateSkill(id: string, skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.baseUrl}/api/admin/skills/${id}`, skill);
  }

  deleteSkill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/skills/${id}`);
  }

  addProject(project: projects): Observable<projects> {
    return this.http.post<projects>(`${this.baseUrl}/api/admin/projects`, project);
  }

  updateProject(id: string, project: projects): Observable<projects> {
    return this.http.put<projects>(`${this.baseUrl}/api/admin/projects/${id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/projects/${id}`);
  }

  getContacts(): Observable<ContactSubmission[]> {
    return this.http.get<ContactSubmission[]>(`${this.baseUrl}/api/admin/contacts`);
  }

  updateProfile(profile: {gitHubProfileLink: string; linkdinProfileLink: string; mailId: string; cvLink?: string;}): Observable<{
    gitHubProfileLink: string;
    linkdinProfileLink: string;
    mailId: string;
    cvLink?: string;
  }> {
    return this.http.put<{
      gitHubProfileLink: string;
      linkdinProfileLink: string;
      mailId: string;
      cvLink?: string;
    }>(`${this.baseUrl}/api/admin/profile`, profile);
  }

  uploadCv(file: File): Observable<{ cvLink: string; cvPublicId: string }> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post<{ cvLink: string; cvPublicId: string }>(`${this.baseUrl}/api/admin/cv`, formData);
  }
}
