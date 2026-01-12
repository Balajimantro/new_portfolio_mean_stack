import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "./pages/navbar/navbar.component";
import { HomeComponent } from "./pages/home/home.component";
import { SkillsComponent } from "./pages/skills/skills.component";
import { GetInTouchComponent } from "./pages/get-in-touch/get-in-touch.component";
import { FooterComponent } from "./pages/footer/footer.component";
import { ProjectsComponent } from "./pages/projects/projects.component";
import { MasterService } from './services/master.service';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-root',
    imports: [NavbarComponent, HomeComponent, SkillsComponent, GetInTouchComponent, FooterComponent, ProjectsComponent, NgxSpinnerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    title = 'balajiPortfolio';

    constructor(private masterService: MasterService, private spinner: NgxSpinnerService) { }

    ngOnInit(): void {
        this.spinner.show();
        this.masterService.getAllProtfolioData();
        this.getHeaderHeight();
    }

    activeSection = 'Home';

    sections = ['Home', 'Skills', 'Projects', 'Contact'];

    ngAfterViewInit(): void {
        const observer = new IntersectionObserver(
            (entries) => {
                if (this.isProgrammaticScroll) return;
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.activeSection = entry.target.id;
                    }
                });
            },
            {
                root: null,
                threshold: 0.8 // 👈 80% visible
            }
        );

        this.sections.forEach(id => {
            const el = document.getElementById(id);
            if (el){
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

    isProgrammaticScroll = false;
    
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
