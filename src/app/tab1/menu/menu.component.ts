import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: false
})
export class MenuComponent implements OnInit {

  @Input() user: User = {} as User;
  @Input() busy!: boolean;

  constructor() { }

  ngOnInit() {
   
  }
}
