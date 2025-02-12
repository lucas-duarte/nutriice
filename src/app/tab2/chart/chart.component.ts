import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { fadeInAnimation } from 'src/app/core/constants/animations';
import { ChartConfigurationData } from 'src/app/core/interfaces/chart-configuration-data';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  animations: [fadeInAnimation],
  standalone: false
})
export class ChartComponent implements OnChanges {

  @Input() chartConfigurationData!: ChartConfigurationData;
  @Input() busy!: boolean;
  chartInstance: Chart | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['busy'] && changes['busy'].currentValue === false && changes['chartConfigurationData']) {
      setTimeout(() => {
        this.initializeChart();
      }, 100)
    }
  }

  initializeChart() {
    const ctx = document.getElementById(this.chartConfigurationData.nameChart) as HTMLCanvasElement;

    if (ctx) {

      // Destroys the existing graph, if any
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      // Register Chart.js plugins
      Chart.register(...registerables);

      
      // Create a new instance of the chart
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartConfigurationData?.labels,
          datasets: [
            {
              data: this.chartConfigurationData?.datas,
              borderWidth: 1,
              borderColor: '#1daa9c', 
              fill: true,  
              backgroundColor: "#1daa9c49"
            },
          ],
        },
        options: {
          scales: {
            x: {
              grid: {
                display: false, // Remove as linhas de grade do eixo X
              },
            },
            y: {
              grid: {
                display: false, // Remove as linhas de grade do eixo Y
              },
            },
          },
          animations: {
            tension: {
              duration: 1000,
              easing: 'linear',
              from: 0,
              to: 0.5,
              loop: false,
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

}
