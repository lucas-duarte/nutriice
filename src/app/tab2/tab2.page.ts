import { Component, OnInit } from '@angular/core';
import { ChartConfigurationData } from '../core/interfaces/chart-configuration-data';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  peso: ChartConfigurationData = {} as ChartConfigurationData;
  busy!: boolean;

  constructor() { }
  ngOnInit(): void {
    this.busy = true;
    setTimeout(() => {
      this.generateCharts();
      this.busy = false;
    }, 100)
  }


  generateCharts() {
    this.peso = {
      nameChart: 'peso',
      titleChart: 'Peso',
      datas: [
        92,
        93,
        90,
        92
      ],
      labels: [
        `01/01/2025`,
        `01/02/2025`,
        `01/02/2025`,
        `01/02/2025`,
      ],
      backgroundColors: ['#1daa9c'],

    }
  }
}
