import { AfterViewInit, Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../navbar/navbar.component';
import { HomeComponent } from '../home/home.component';
import { SkillsComponent } from '../skills/skills.component';
import { ProjectsComponent } from '../projects/projects.component';
import { GetInTouchComponent } from '../get-in-touch/get-in-touch.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { MasterService } from '../../services/master.service';

@Component({
  selector: 'app-portfolio-page',
  imports: [
    CommonModule,
    NavbarComponent,
    HomeComponent,
    SkillsComponent,
    ProjectsComponent,
    GetInTouchComponent,
    SpinnerComponent,
    AiChatComponent
  ],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.css'
})
export class PortfolioPageComponent implements OnInit, AfterViewInit, OnDestroy {
  showSpinner = true;
  loadFailed = false;
  activeSection = 'Home';
  isProgrammaticScroll = false;

  sections = ['Home', 'Skills', 'Projects', 'Contact'];

  private observer?: IntersectionObserver;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private masterService: MasterService) {
    window.scrollTo(0, 0);
  }

  ngOnInit(): void {
    this.masterService.getAllProtfolioData();
    this.getHeaderHeight();

    this.masterService.loading
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        if (!loading) this.showSpinner = false;
      });

    this.masterService.loadError
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((failed) => (this.loadFailed = failed));

    // Safety net: never trap the visitor behind the spinner.
    setTimeout(() => (this.showSpinner = false), 15000);
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.isProgrammaticScroll) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      {
        root: null,
        threshold: 0.35,
        rootMargin: '-20% 0px -45% 0px'
      }
    );

    setTimeout(() => {
      this.sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) this.observer?.observe(el);
      });
    });
  }

  retry(): void {
    this.showSpinner = true;
    this.masterService.getAllProtfolioData();
  }

  getHeaderHeight(): void {
    const header = document.getElementById('navbar');
    if (header) {
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
  }

  navActiveMenu(menu: string): void {
    this.isProgrammaticScroll = true;
    setTimeout(() => (this.isProgrammaticScroll = false), 700);

    const el = document.getElementById(menu);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = menu;
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
