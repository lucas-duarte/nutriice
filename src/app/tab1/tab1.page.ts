import { Component, OnInit } from '@angular/core';
import { Bioimpedancia } from '../core/interfaces/bioimpedancia';
import { User } from '../core/interfaces/user';
import { fadeInAnimation, fadeOutAnimation } from '../core/constants/animations';
import { BioimpedanciaService } from '../core/services/bioimpedancia/bioimpedancia.service';
import { UserService } from '../core/services/user/user.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
  animations: [fadeInAnimation, fadeOutAnimation]
})
export class Tab1Page implements OnInit {

  user: User = {} as User;
  bioimpedancia: Bioimpedancia = {} as Bioimpedancia;
  busy: boolean = true;
  busyUser: boolean = true;

  constructor(private bioimpedanciaService: BioimpedanciaService, private userService: UserService) { }

  ngOnInit(): void {
    this.getBio();
    this.getUser();
  }

  handleRefresh(event: CustomEvent) {
    this.bioimpedanciaService.getAll().subscribe({
      next: (response) => {
        this.bioimpedancia = response.result[0];
        (event?.target as HTMLIonRefresherElement).complete();
      },
      error: () => {
        (event?.target as HTMLIonRefresherElement).complete();
      }
    })
  }

  getBio() {

    this.busy = true;

    this.bioimpedanciaService.getAll().subscribe({
      next: (response) => {
        console.log(response)
        this.bioimpedancia = response.result[0]
        this.busy = false;
      },
      error: () => {
        this.busy = false;
      }
    })
  }


  getUser() {
    this.busyUser = true;

    const params = new HttpParams().set('filter', `eq(Email,'lucasduarte647@gmail.com')`)

    this.userService.getAll(params).subscribe({
      next: (response) => {
        this.user = response.result[0];
        console.log(response)
        this.busyUser = false;
      },
      error: () => {
        this.busyUser = false;
      }
    })
  }

}
