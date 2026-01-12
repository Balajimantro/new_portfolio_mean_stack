import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MasterService } from '../../services/master.service';

export interface projects {
  image?: string
  title: string
  description: string
  technology: string[]
  githubLink?: string
  publishLink?: string
}

@Component({
  selector: 'app-projects',
  imports: [CommonModule, NgClass],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {

  projectDescription: string = `Some of the projects I've worked on recently`;
  projects: projects[] = [];
  hoverProjectIndex: number = -1;

  constructor(private masterService: MasterService) { }

  ngOnInit(): void {
    this.masterService.allPortfolioData.subscribe(data => {
      this.projects = data.projects;
    })
  };

  openLink(link: string){
    window.open(link)
  }
}


