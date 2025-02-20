import { Component, OnInit } from '@angular/core';
import { Dieta } from '../core/interfaces/dieta';
import { DietaService } from '../core/services/dieta/dieta.service';
import { fadeInAnimation, fadeOutAnimation } from '../core/constants/animations';
import { RefeicoesService } from '../core/services/refeicoes/refeicoes.service';
import { Refeicao } from '../core/interfaces/refeicao';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
  animations: [fadeInAnimation, fadeOutAnimation]
})
export class Tab3Page implements OnInit {

  dieta: Dieta = {} as Dieta;
  refeicoes: Refeicao[] = []

  constructor(private dietaService: DietaService, private refeicoesService: RefeicoesService) { }

  ngOnInit(): void {
    this.getDietas();
  }


  getDietas(event?: any): void {
    this.dietaService.getAll().subscribe({
      next: (response) => {
        console.log(response)
        this.dieta = response.result[1];
        this.getRefeicoes(this.dieta.id)
      },
      error: (error) => {
        console.log(error)
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getRefeicoes(dietaId: number): void {

    console.log("Chamando")
    // const params = new HttpParams().set('dietaId', dietaId);
    this.refeicoesService.getAll(dietaId).subscribe({
      next: (response) => {
        console.log(response)
        this.refeicoes = response.result;
      },
      error: (error) => {
        console.log(error)
      }
    });
  }

}