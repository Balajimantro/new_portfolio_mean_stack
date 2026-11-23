import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterService } from '../../services/master.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { TiltDirective } from '../../shared/tilt.directive';

export interface ContactInfo {
  label: string;
  value: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-get-in-touch',
  imports: [ReactiveFormsModule, RevealDirective, TiltDirective],
  templateUrl: './get-in-touch.component.html',
  styleUrl: './get-in-touch.component.css'
})
export class GetInTouchComponent implements OnInit {
  readonly getInTouchDescription = 'Have a project in mind, a role to fill, or just want to say hi? My inbox is open.';

  readonly status = signal<FormStatus>('idle');
  readonly copied = signal(false);

  contactInfo: ContactInfo[] = [];
  whyWorkWithMe: string[] = [];
  mailId = '';
  contactFrom!: FormGroup;

  private readonly destroyRef = inject(DestroyRef);

  constructor(private fb: FormBuilder, private masterService: MasterService) {}

  ngOnInit(): void {
    this.initializeContactForm();

    this.masterService.allPortfolioData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.mailId = data?.mailId || '';
        // console.log('ContactInfo:', data);
        // console.log('mailId:', this.mailId);
        const info = data?.ContactInfo;
        this.contactInfo = info?.length
          ? info
          : [
              { label: 'Email', value: this.mailId || 'balajimantro4123@gmail.com' },
              { label: 'Phone', value: '+91 7397139420' },
              { label: 'Location', value: 'Tirupathur, Tamil Nadu, India' }
            ];

        this.whyWorkWithMe = data?.whyWorkWithMe?.length
          ? data.whyWorkWithMe
          : [
              'Clean, maintainable code',
              'Fast delivery & clear communication',
              'Modern tech stack expertise',
              'Startup mindset — I ship'
            ];
      });
  }

  initializeContactForm(): void {
    this.contactFrom = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s.'-]+$/u)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      website: ['']
    });
  }

  isInvalid(field: string): boolean {
    const control = this.contactFrom.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  submitContactForm(): void {
    if (this.contactFrom.invalid) {
      this.contactFrom.markAllAsTouched();
      return;
    }

    // Honeypot filled → silently pretend success and drop it.
    if (this.contactFrom.get('website')?.value) {
      this.contactFrom.reset();
      this.status.set('success');
      return;
    }

    this.status.set('sending');
    const payload = this.contactFrom.value as ContactForm;

    this.masterService
      .submitContactForm(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.contactFrom.reset();
          this.status.set('success');
          setTimeout(() => this.status.set('idle'), 7000);
        },
        error: () => {
          this.status.set('error');
        }
      });
  }

  async copyEmail(email: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(email);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }
}
