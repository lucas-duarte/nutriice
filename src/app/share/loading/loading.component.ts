import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {

  constructor() { }


  @Input() busy: boolean = false;
  
  @Input() width: string = '100px';
  @Input() height: string = '100px';

  @Input() firstChildColor = '#ffffff';
  @Input() firstChildDelay = '-1.5s';

  @Input() secondChildColor = '#85e9df';
  @Input() secondChildDelay = '-1s';

  thirdChildColor = '#ffffff';
  thirdChildDelay = '-0.5s';

  lastChildColor = '#85e9df';
  lastChildDelay = '0s';

  ngOnInit() { }

}
