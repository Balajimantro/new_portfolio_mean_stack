import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../services/master.service';

export interface Skill {
  technology: string;
  level: string;
  languages: string[];
}

@Component({
  selector: 'app-skills',
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent implements OnInit {

  skills: Skill[] = [];
  titleDescription: string = 'Technologies I work with on a daily basis';

  constructor(private masterService: MasterService) { }
  
  ngOnInit(): void {
    this.masterService.allPortfolioData.subscribe(data => {
      this.skills = data.skills;
    });
  }
}
