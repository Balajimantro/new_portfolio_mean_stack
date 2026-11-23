import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterService } from '../../services/master.service';
import { TiltDirective } from '../../shared/tilt.directive';
import { RevealDirective } from '../../shared/reveal.directive';

export interface Skill {
  id?: string;
  technology: string;
  level: string;
  languages: string[];
}

@Component({
  selector: 'app-skills',
  imports: [TiltDirective, RevealDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  uniqueLanguages: string[] = [];
  titleDescription = 'The tools, frameworks and languages I reach for to turn ideas into working products';

  private readonly destroyRef = inject(DestroyRef);

  constructor(private masterService: MasterService) {}

  ngOnInit(): void {
    this.masterService.allPortfolioData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.skills = data?.skills || [];
        this.uniqueLanguages = Array.from(
          new Set(this.skills.flatMap((skill) => skill.languages || []))
        );
      });
  }
}
