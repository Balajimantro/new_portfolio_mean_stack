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
  profileForm: FormGroup;
  cvFile: File | null = null;
  isUploadingCv = false;

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

    this.profileForm = this.fb.group({
      gitHubProfileLink: ['', Validators.required],
      linkdinProfileLink: ['', Validators.required],
      mailId: ['', Validators.required],
      cvLink: ['']
    });
  }

  ngOnInit(): void {
    this.masterService.getAllProtfolioData();
    this.masterService.allPortfolioData.subscribe((data) => {
      this.skills = data.skills || [];
      this.projects = data.projects || [];
      this.profileForm.patchValue(
        {
          gitHubProfileLink: data.gitHubProfileLink || '',
          linkdinProfileLink: data.linkdinProfileLink || '',
          mailId: data.mailId || '',
          cvLink: data.resume?.cvLink || ''
        },
        { emitEvent: false }
      );
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
        window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
      });
      return;
    }

    this.adminService.addSkill(skillPayload).subscribe(() => {
      this.resetSkillForm();
      this.masterService.getAllProtfolioData();
      this.message = 'Skill added successfully';
      window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
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
      window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
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
        window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
      });
      return;
    }

    this.adminService.addProject(projectPayload).subscribe(() => {
      this.resetProjectForm();
      this.masterService.getAllProtfolioData();
      this.message = 'Project added successfully';
      window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
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
      window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
    });
  }

  resetProjectForm(): void {
    this.editingProjectId = null;
    this.projectForm.reset();
  }

  goBack(): void {
    this.router.navigate(['']);
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.adminService.updateProfile(this.profileForm.value).subscribe(() => {
      this.masterService.getAllProtfolioData();
      this.message = 'Profile links updated successfully';
      window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
    });
  }

  onCvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cvFile = input.files && input.files.length ? input.files[0] : null;
  }

  uploadCv(): void {
    if (!this.cvFile) {
      this.message = 'Please choose a PDF file first';
      window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
      return;
    }

    this.isUploadingCv = true;
    this.adminService.uploadCv(this.cvFile).subscribe({
      next: () => {
        this.isUploadingCv = false;
        this.cvFile = null;
        this.masterService.getAllProtfolioData();
        this.message = 'CV uploaded successfully';
        window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: () => {
        this.isUploadingCv = false;
        this.message = 'CV upload failed';
        window.scrollTo(0, 0);
        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    });
  }
}
