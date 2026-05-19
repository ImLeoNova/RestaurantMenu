import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NotFoundComponent } from '../../components/not-found/not-found.component';
import { NgClass, NgIf } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { AiComponent } from '../../AI/ai/ai.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    NotFoundComponent,
    NgIf,
    NgClass,
    FooterComponent,
    AiComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  fromCOMPONENT: string = '';
  constructor(
    private title: Title,
    private route: ActivatedRoute,
    private router: Router,
    public categoryService: CategoryService,
  ) {
    title.setTitle('Arian Restaurant');
    this.route.queryParams.subscribe((params) => {
      this.fromCOMPONENT = params['data'] || 'not';
    });

    setTimeout(() => {
      this.fromCOMPONENT = 'not';
      // delete route
      this.router.navigate([]);
    }, 2000);
  }
}
