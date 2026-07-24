import { Component, OnInit } from '@angular/core';
import { MasterService } from '../../services/master.service';
import { API_BASE_URL } from '../../services/api.config';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  
  name: string = '';
  role: string = '';
  description: string = "";
  gitHubLink: string = '';
  linkdinLink: string = '';
  mailId: string = '';
  cvLink: string = '';

  constructor(private masterService: MasterService) { }

  ngOnInit(): void {
    this.masterService.allPortfolioData.subscribe(data => {
      this.name = data.name;
      this.role = data.role;
      this.description = data.description;
      this.gitHubLink = data.gitHubProfileLink;
      this.linkdinLink = data.linkdinProfileLink;
      this.mailId = data.mailId;
      this.cvLink = data.resume?.cvLink || '';
    })
  };

  downloadCV() {
    const cvUrl = this.cvLink
      ? (this.cvLink.startsWith('http') ? this.cvLink : `${API_BASE_URL}${this.cvLink}`)
      : './assets/balajiSoftwareDeveloper.pdf';
    window.open(cvUrl, '_blank'); 
  }

  redirectToDetInTouch() {
    const element = document.documentElement.querySelector('#Contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
