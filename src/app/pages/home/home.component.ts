import { Component, OnInit } from '@angular/core';
import { MasterService } from '../../services/master.service';

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

  constructor(private masterService: MasterService) { }

  ngOnInit(): void {
    this.masterService.allPortfolioData.subscribe(data => {
      this.name = data.name;
      this.role = data.role;
      this.description = data.description;
      this.gitHubLink = data.gitHubProfileLink;
      this.linkdinLink = data.linkdinProfileLink;
      this.mailId = data.mailId;
    })
  }
}
