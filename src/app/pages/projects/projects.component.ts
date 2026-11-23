import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterService } from '../../services/master.service';
import { UiService } from '../../shared/ui.service';
import { TiltDirective } from '../../shared/tilt.directive';
import { RevealDirective } from '../../shared/reveal.directive';

export interface projects {
  id?: string;
  image?: string;
  title: string;
  description: string;
  technology: string[];
  githubLink?: string;
  publishLink?: string;
}

@Component({
  selector: 'app-projects',
  imports: [TiltDirective, RevealDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  readonly projectDescription = 'A selection of things I have designed, built and shipped end to end';

  readonly projects = signal<projects[]>([]);
  readonly activeFilter = signal<string | null>(null);

  readonly filters = computed(() => {
    const techs = new Set<string>();
    this.projects().forEach((project) => {
      (project.technology || []).forEach((tech) => techs.add(tech));
    });
    return Array.from(techs).sort((a, b) => a.localeCompare(b));
  });

  readonly filtered = computed(() => {
    const filter = this.activeFilter();
    const items = this.projects();
    if (!filter) return items;
    const needle = filter.toLowerCase();
    return items.filter((project) =>
      (project.technology || []).some((tech) => tech.toLowerCase() === needle)
    );
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private masterService: MasterService,
    private ui: UiService
  ) {
    this.masterService.allPortfolioData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.projects.set(data?.projects || []);
      });

    // The AI copilot can ask us to filter the grid.
    effect(() => {
      const requested = this.ui.projectFilter();
      if (!requested) return;
      this.activeFilter.set(requested);
      this.ui.setProjectFilter(null);
      setTimeout(() => {
        document.getElementById('Projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });
  }

  setFilter(filter: string | null): void {
    this.activeFilter.set(this.activeFilter() === filter ? null : filter);
  }

  safeLink(link?: string): string {
    if (!link) return '';
    const trimmed = link.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : '';
  }

  initials(title: string): string {
    return (title || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
