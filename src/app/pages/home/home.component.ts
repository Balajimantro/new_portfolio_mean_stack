import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterService } from '../../services/master.service';
import { API_BASE_URL } from '../../services/api.config';
import { HeroSceneComponent } from './hero-scene.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-home',
  imports: [HeroSceneComponent, RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  name = '';
  role = '';
  description = '';
  gitHubLink = '';
  linkdinLink = '';
  mailId = '';
  cvLink = '';

  projectCount = 0;
  skillCount = 0;
  techCount = 0;

  private readonly destroyRef = inject(DestroyRef);

  constructor(private masterService: MasterService) {}

  ngOnInit(): void {
    this.masterService.allPortfolioData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (!data) return;

        this.name = data.name;
        this.role = data.role;
        this.description = data.description;
        this.gitHubLink = data.gitHubProfileLink;
        this.linkdinLink = data.linkdinProfileLink;
        this.mailId = data.mailId;
        this.cvLink = data.resume?.cvLink || '';

        this.projectCount = data.projects?.length ?? 0;
        this.skillCount = data.skills?.length ?? 0;
        this.techCount = new Set(
          (data.skills || []).flatMap((skill) => skill.languages || [])
        ).size;
      });
  }

  downloadCV(): void {
    const cvUrl = this.cvLink
      ? this.cvLink.startsWith('http')
        ? this.cvLink
        : `${API_BASE_URL}${this.cvLink}`
      : './assets/balajiSoftwareDeveloper.pdf';
    window.open(cvUrl, '_blank', 'noopener');
  }

  redirectToDetInTouch(): void {
    const element = document.querySelector('#Contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
