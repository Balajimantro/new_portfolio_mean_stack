import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { HomeComponent } from '../home/home.component';
import { SkillsComponent } from '../skills/skills.component';
import { ProjectsComponent } from '../projects/projects.component';
import { GetInTouchComponent } from '../get-in-touch/get-in-touch.component';
import { SpinnerComponent } from '../spinner/spinner.component';
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
    SpinnerComponent
  ],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.css'
})
export class PortfolioPageComponent implements OnInit {
  showSpinner = true;
  activeSection = 'Home';
  isProgrammaticScroll = false;

  sections = ['Home', 'Skills', 'Projects', 'Contact'];

  constructor(private masterService: MasterService) {
    window.scrollTo(0, 0);
  }

  ngOnInit(): void {
    this.masterService.getAllProtfolioData();
    this.getHeaderHeight();

    this.masterService.allPortfolioData.subscribe((data) => {
      if (data.name) {
        this.showSpinner = false;
      }
    });
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
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
        threshold: 0.8
      }
    );

    this.sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });
  }

  getHeaderHeight() {
    const header = document.getElementById('navbar');
    if (header) {
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
  }

  navActiveMenu(menu: string) {
    this.isProgrammaticScroll = true;

    setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 500);

    const el = document.getElementById(menu);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = menu;
    }
  }
}
