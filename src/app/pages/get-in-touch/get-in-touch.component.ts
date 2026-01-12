import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../services/master.service';
import { NgxSpinnerService } from 'ngx-spinner';

export interface ContactInfo {
  label: string;
  value: string;
};

export interface ContactForm {
  name: string;
  email: string;
  message: string;
  subject: string;
}

@Component({
  selector: 'app-get-in-touch',
  imports: [NgClass, ReactiveFormsModule, CommonModule],
  templateUrl: './get-in-touch.component.html',
  styleUrl: './get-in-touch.component.css'
})

export class GetInTouchComponent implements OnInit {

  getInTouchDescription: string = `Let's discuss your next project or opportunity`;

  contactInfo: ContactInfo[] = [];
  whyWorkWithMe: string[] = []
  hoveredContactInforIndex: number = -1;
  contactFrom!: FormGroup;

  constructor(private fb: FormBuilder, private masterServise : MasterService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.initailizeContactForm();

    this.masterServise.allPortfolioData.subscribe(data => {


      if(data && data.ContactInfo) {
        this.contactInfo = [];
        this.contactInfo = data.ContactInfo;
      } else {
        this.contactInfo = [
          {
            label: 'Email',
            value: 'balajimantro4123@gmail.com'
          },
          {
            label: 'Phone',
            value: '+91 7397139420'
          },
          {
            label: 'Location',
            value: 'Tirupathur, Tamil Nadu, India'
          }
        ];
      };

      if(data && data.whyWorkWithMe) {
        this.whyWorkWithMe = data.whyWorkWithMe;
      } else {
        this.whyWorkWithMe = [
          'Clean, maintainable code',
          'Fast delivery & communication',
          'Modern tech stack expertise',
          'Startup experience'
        ];
      }

    })
  };

  initailizeContactForm() {
    this.contactFrom = this.fb.group({
      name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._-]+@[a-z.-]+\[.]{1}[a-z]{2,}$')]),
      message: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      subject: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')])

    })
  }

  get name() {
    return this.contactFrom.get('name');
  }

  get email() {
    return this.contactFrom.get('email');
  }

  get message() {
    return this.contactFrom.get('message');
  }

  get subject() {
    return this.contactFrom.get('subject');
  }

  mouseHoveredContactInforIndex(index: number) {
    this.hoveredContactInforIndex = index;
  }

  mouseLeavedContactInforIndex() {
    this.hoveredContactInforIndex = -1;
  };

  isContactFormSubmitted: boolean = false;
  submitContactForm() {
    if(this.contactFrom.valid) {
      this.spinner.show();
      this.masterServise.submitContactForm(this.contactFrom.value).subscribe({
        next: () => {
          this.isContactFormSubmitted = true;
          this.contactFrom.reset();
          this.spinner.hide();
          this.scrollToSaveText()

          setTimeout(() => {
            this.isContactFormSubmitted = false;
          }, 3000);

        },
        error: () => {

          this.spinner.hide();
        }
      })
    } else {
      this.contactFrom.markAllAsTouched();
    }
  };

  scrollToSaveText() {
    const element = document.getElementById('getInTouch_contact_form_id');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
