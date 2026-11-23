import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterService } from '../../services/master.service';
import { AdminService, LeadInsight } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Skill } from '../skills/skills.component';
import { projects } from '../projects/projects.component';
import { ContactSubmission } from '../../models/contact-submission';

interface InsightState {
  loading: boolean;
  data?: LeadInsight;
  error?: string;
}

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

  readonly insights = signal<Record<string, InsightState>>({});

  private readonly destroyRef = inject(DestroyRef);

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
    this.masterService.allPortfolioData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
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
    this.adminService
      .getContacts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.contacts = data || [];
      });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['']);
    });
  }

  // ---------- AI lead assistant ----------
  insightFor(id: string): InsightState | undefined {
    return this.insights()[id];
  }

  analyzeLead(contact: ContactSubmission): void {
    const id = contact._id;
    this.insights.update((map) => ({ ...map, [id]: { loading: true } }));

    this.adminService
      .analyzeLead({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.insights.update((map) => ({ ...map, [id]: { loading: false, data } })),
        error: () =>
          this.insights.update((map) => ({
            ...map,
            [id]: { loading: false, error: 'Could not generate a summary right now.' }
          }))
      });
  }

  copyReply(text: string): void {
    if (!navigator.clipboard) {
      this.flash('Clipboard is not available in this browser');
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => this.flash('Reply copied to clipboard'))
      .catch(() => this.flash('Could not copy reply'));
  }

  openReply(contact: ContactSubmission, reply: string): void {
    const subject = encodeURIComponent(`Re: ${contact.subject}`);
    const body = encodeURIComponent(reply);
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
  }

  // ---------- skills ----------
  submitSkill(): void {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      return;
    }

    const skillPayload: Skill = {
      technology: this.skillForm.value.technology,
      level: this.skillForm.value.level,
      languages: this.skillForm.value.languages
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
    };

    if (this.editingSkillId) {
      this.adminService.updateSkill(this.editingSkillId, skillPayload).subscribe(() => {
        this.resetSkillForm();
        this.masterService.getAllProtfolioData();
        this.flash('Skill updated successfully');
      });
      return;
    }

    this.adminService.addSkill(skillPayload).subscribe(() => {
      this.resetSkillForm();
      this.masterService.getAllProtfolioData();
      this.flash('Skill added successfully');
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
      this.flash('Skill deleted successfully');
    });
  }

  resetSkillForm(): void {
    this.editingSkillId = null;
    this.skillForm.reset();
  }

  // ---------- projects ----------
  submitProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const projectPayload: projects = {
      title: this.projectForm.value.title,
      description: this.projectForm.value.description,
      technology: this.projectForm.value.technology
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean),
      image: this.projectForm.value.image || undefined,
      githubLink: this.projectForm.value.githubLink || undefined,
      publishLink: this.projectForm.value.publishLink || undefined
    };

    if (this.editingProjectId) {
      this.adminService.updateProject(this.editingProjectId, projectPayload).subscribe(() => {
        this.resetProjectForm();
        this.masterService.getAllProtfolioData();
        this.flash('Project updated successfully');
      });
      return;
    }

    this.adminService.addProject(projectPayload).subscribe(() => {
      this.resetProjectForm();
      this.masterService.getAllProtfolioData();
      this.flash('Project added successfully');
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
      this.flash('Project deleted successfully');
    });
  }

  resetProjectForm(): void {
    this.editingProjectId = null;
    this.projectForm.reset();
  }

  // ---------- profile ----------
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
      this.flash('Profile links updated successfully');
    });
  }

  onCvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cvFile = input.files && input.files.length ? input.files[0] : null;
  }

  uploadCv(): void {
    if (!this.cvFile) {
      this.flash('Please choose a PDF file first');
      return;
    }

    this.isUploadingCv = true;
    this.adminService.uploadCv(this.cvFile).subscribe({
      next: () => {
        this.isUploadingCv = false;
        this.cvFile = null;
        this.masterService.getAllProtfolioData();
        this.flash('CV uploaded successfully');
      },
      error: (err) => {
        this.isUploadingCv = false;
        this.flash(err?.error?.message || 'CV upload failed');
      }
    });
  }

  private flash(text: string): void {
    this.message = text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this.message = '';
    }, 3500);
  }
}
