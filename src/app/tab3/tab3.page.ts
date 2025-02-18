import { Component, OnInit } from '@angular/core';
import { Dieta } from '../core/interfaces/dieta';
import { DietaService } from '../core/services/dieta/dieta.service';
import { fadeInAnimation, fadeOutAnimation } from '../core/constants/animations';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
  animations: [fadeInAnimation, fadeOutAnimation]
})
export class Tab3Page implements OnInit {

  dieta: Dieta = {} as Dieta;  

  constructor(private dietaService: DietaService) {}

  ngOnInit(): void {
    this.getDietas();
  }


  getDietas(event?: any): void {
    this.dietaService.getDieta().subscribe({
      next: (data) => {
        this.dieta = data[0];
        console.log(this.dieta)
        if (event) {
          setTimeout(() => {
            event.target.complete();
          }, 2000);
        }
      },
      error: (error) => {
        console.log(error)
        if (event) {
          event.target.complete();
        }
      }
    });
  }

}