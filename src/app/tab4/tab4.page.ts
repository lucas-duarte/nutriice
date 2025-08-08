import { Component } from '@angular/core';

interface MedidasCorporais {
  abdomen: number;
  braco: number;
  costas: number;
}

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {
  medidas: MedidasCorporais = {
    abdomen: 0,
    braco: 0,
    costas: 0,
  };

  constructor() {
    // Valores de exemplo; em uma aplicação real os dados viriam de um serviço
    this.medidas = {
      abdomen: 80,
      braco: 30,
      costas: 25,
    };
  }
}
