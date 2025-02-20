import { Component, OnInit } from '@angular/core';
import { ChartConfigurationData } from '../core/interfaces/chart-configuration-data';
import { Bioimpedancia } from '../core/interfaces/bioimpedancia';
import { fadeInAnimation, fadeOutAnimation } from '../core/constants/animations';
import { BioimpedanciaService } from '../core/services/bioimpedancia/bioimpedancia.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page implements OnInit {

  bioimpedancias: Bioimpedancia[] = [];

  peso: ChartConfigurationData = {} as ChartConfigurationData;
  imc: ChartConfigurationData = {} as ChartConfigurationData;
  gorduraCorporal: ChartConfigurationData = {} as ChartConfigurationData;
  aguaCorporal: ChartConfigurationData = {} as ChartConfigurationData;
  massaEsqueletica: ChartConfigurationData = {} as ChartConfigurationData;
  tmb: ChartConfigurationData = {} as ChartConfigurationData;
  massaLivreGordura: ChartConfigurationData = {} as ChartConfigurationData;
  gorduraSubcutanea: ChartConfigurationData = {} as ChartConfigurationData;
  gorduraVisceral: ChartConfigurationData = {} as ChartConfigurationData;
  massaMuscular: ChartConfigurationData = {} as ChartConfigurationData;
  massaOssea: ChartConfigurationData = {} as ChartConfigurationData;
  proteina: ChartConfigurationData = {} as ChartConfigurationData;
  idadeMetabolica: ChartConfigurationData = {} as ChartConfigurationData;

  busy!: boolean;
  selectedSegment: string = 'Recente';

  constructor(private bioimpedanciaService: BioimpedanciaService) { }

  ngOnInit(): void {
    this.getBio();
  }

  generateCharts() {

    this.peso = {
      nameChart: 'peso',
      titleChart: 'Peso',
      datas: this.bioimpedancias.map(v => v.peso),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.imc = {
      nameChart: 'imc',
      titleChart: 'IMC',
      datas: this.bioimpedancias.map(item => item.imc),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.gorduraCorporal = {
      nameChart: 'gorduraCorporal',
      titleChart: 'Gordura Corporal',
      datas: this.bioimpedancias.map(item => item.gorduraCorporal),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.aguaCorporal = {
      nameChart: 'aguaCorporal',
      titleChart: 'Agua Corporal',
      datas: this.bioimpedancias.map(item => item.aguaCorporal),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.massaEsqueletica = {
      nameChart: 'massaEsqueletica',
      titleChart: 'Massa Esquelética',
      datas: this.bioimpedancias.map(item => item.massaEsqueletica),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.tmb = {
      nameChart: 'tmb',
      titleChart: 'TMB(Kcal)',
      datas: this.bioimpedancias.map(item => item.tmb),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.massaLivreGordura = {
      nameChart: 'massaLivreGordura',
      titleChart: 'Massa Livre Gordura',
      datas: this.bioimpedancias.map(item => item.massaLivreGordura),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.gorduraSubcutanea = {
      nameChart: 'gorduraSubcutanea',
      titleChart: 'Gordura Subcutânea',
      datas: this.bioimpedancias.map(item => item.gorduraSubcutanea),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.gorduraVisceral = {
      nameChart: 'gorduraVisceral',
      titleChart: 'Gordura Visceral',
      datas: this.bioimpedancias.map(item => item.gorduraVisceral),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.massaMuscular = {
      nameChart: 'massaMuscular',
      titleChart: 'Massa Muscular',
      datas: this.bioimpedancias.map(item => item.massaMuscular),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.massaOssea = {
      nameChart: 'massaOssea',
      titleChart: 'Massa Óssea(Kg)',
      datas: this.bioimpedancias.map(item => item.massaOssea),
      labels: this.bioimpedancias.map(item => new Date(item.massaOssea).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.proteina = {
      nameChart: 'proteina',
      titleChart: 'Proteína(%)',
      datas: this.bioimpedancias.map(item => item.proteina),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }

    this.idadeMetabolica = {
      nameChart: 'idadeMetabolica',
      titleChart: 'Idade Metabólica',
      datas: this.bioimpedancias.map(item => item.idadeMetabolica),
      labels: this.bioimpedancias.map(item => new Date(item.dataBio).toLocaleDateString()),
      backgroundColors: ['#1daa9c'],
    }
  }

  segmentChanged(event: Event) {
    console.log(event)
  }

  getBio() {

    this.busy = true;

    this.bioimpedanciaService.getAll().subscribe({
      next: (response) => {
        this.bioimpedancias = response.result
        this.generateCharts();
        this.busy = false;
      },
      error: () => {
        this.busy = false;
      }
    })
  }
}
