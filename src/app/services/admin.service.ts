import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Skill } from '../pages/skills/skills.component';
import { projects } from '../pages/projects/projects.component';
import { ContactSubmission } from '../models/contact-submission';

export interface LeadInsight {
  summary: string;
  category: 'recruiter' | 'client' | 'spam' | 'other';
  reply: string;
  ai: boolean;
}

export interface ProfilePayload {
  gitHubProfileLink?: string;
  linkdinProfileLink?: string;
  mailId?: string;
  cvLink?: string;
}

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

  getContacts(limit = 50): Observable<ContactSubmission[]> {
    return this.http.get<ContactSubmission[]>(`${this.baseUrl}/api/admin/contacts?limit=${limit}`);
  }

  updateProfile(profile: ProfilePayload): Observable<ProfilePayload> {
    return this.http.put<ProfilePayload>(`${this.baseUrl}/api/admin/profile`, profile);
  }

  uploadCv(file: File): Observable<{ success: boolean; resume: { cvLink: string; publicId: string; fileName: string } }> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post<{ success: boolean; resume: { cvLink: string; publicId: string; fileName: string } }>(
      `${this.baseUrl}/api/admin/cv`,
      formData
    );
  }

  analyzeLead(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Observable<LeadInsight> {
    return this.http.post<LeadInsight>(`${this.baseUrl}/api/ai/lead`, payload);
  }
}
