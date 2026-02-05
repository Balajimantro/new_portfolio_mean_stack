import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../services/master.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Skill } from '../skills/skills.component';
import { projects } from '../projects/projects.component';
import { ContactSubmission } from '../../models/contact-submission';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  skills: Skill[] = [];
  projects: projects[] = [];
  contacts: ContactSubmission[] = [];

  skillForm: FormGroup;
  projectForm: FormGroup;

  editingSkillId: string | null = null;
  editingProjectId: string | null = null;

  message = '';

  constructor(
    private masterService: MasterService,
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.skillForm = this.fb.group({
      technology: ['', Validators.required],
      level: ['', Validators.required],
      languages: ['', Validators.required]
    });

    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      technology: ['', Validators.required],
      image: [''],
      githubLink: [''],
      publishLink: ['']
    });
  }

  ngOnInit(): void {
    this.masterService.getAllProtfolioData();
    this.masterService.allPortfolioData.subscribe((data) => {
      this.skills = data.skills || [];
      this.projects = data.projects || [];
    });

    this.loadContacts();
  }

  loadContacts(): void {
    this.adminService.getContacts().subscribe((data) => {
      this.contacts = data || [];
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['']);
    }) 
  }

  submitSkill(): void {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      return;
    }

    const skillPayload: Skill = {
      technology: this.skillForm.value.technology,
      level: this.skillForm.value.level,
      languages: this.skillForm.value.languages.split(',').map((item: string) => item.trim()).filter(Boolean)
    };

    if (this.editingSkillId) {
      this.adminService.updateSkill(this.editingSkillId, skillPayload).subscribe(() => {
        this.resetSkillForm();
        this.masterService.getAllProtfolioData();
        this.message = 'Skill updated successfully';
      });
      return;
    }

    this.adminService.addSkill(skillPayload).subscribe(() => {
      this.resetSkillForm();
      this.masterService.getAllProtfolioData();
      this.message = 'Skill added successfully';
    });
  }

  editSkill(skill: Skill): void {
    this.editingSkillId = skill.id || null;
    this.skillForm.patchValue({
      technology: skill.technology,
      level: skill.level,
      languages: (skill.languages || []).join(', ')
    });
  }

  deleteSkill(skill: Skill): void {
    if (!skill.id) return;
    this.adminService.deleteSkill(skill.id).subscribe(() => {
      this.masterService.getAllProtfolioData();
      this.message = 'Skill deleted successfully';
    });
  }

  resetSkillForm(): void {
    this.editingSkillId = null;
    this.skillForm.reset();
  }

  submitProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const projectPayload: projects = {
      title: this.projectForm.value.title,
      description: this.projectForm.value.description,
      technology: this.projectForm.value.technology.split(',').map((item: string) => item.trim()).filter(Boolean),
      image: this.projectForm.value.image || undefined,
      githubLink: this.projectForm.value.githubLink || undefined,
      publishLink: this.projectForm.value.publishLink || undefined
    };

    if (this.editingProjectId) {
      this.adminService.updateProject(this.editingProjectId, projectPayload).subscribe(() => {
        this.resetProjectForm();
        this.masterService.getAllProtfolioData();
        this.message = 'Project updated successfully';
      });
      return;
    }

    this.adminService.addProject(projectPayload).subscribe(() => {
      this.resetProjectForm();
      this.masterService.getAllProtfolioData();
      this.message = 'Project added successfully';
    });
  }

  editProject(project: projects): void {
    this.editingProjectId = project.id || null;
    this.projectForm.patchValue({
      title: project.title,
      description: project.description,
      technology: (project.technology || []).join(', '),
      image: project.image || '',
      githubLink: project.githubLink || '',
      publishLink: project.publishLink || ''
    });
  }

  deleteProject(project: projects): void {
    if (!project.id) return;
    this.adminService.deleteProject(project.id).subscribe(() => {
      this.masterService.getAllProtfolioData();
      this.message = 'Project deleted successfully';
    });
  }

  resetProjectForm(): void {
    this.editingProjectId = null;
    this.projectForm.reset();
  }

  goBack(): void {
    this.router.navigate(['']);
  }
}
