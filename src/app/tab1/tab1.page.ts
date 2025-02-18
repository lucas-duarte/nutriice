import { Component, OnInit } from '@angular/core';
import { Bioimpedancia } from '../core/interfaces/bioimpedancia';
import { User } from '../core/interfaces/user';
import { fadeInAnimation, fadeOutAnimation } from '../core/constants/animations';
import { BioimpedanciaService } from '../core/services/bioimpedancia/bioimpedancia.service';
import { UserService } from '../core/services/user/user.service';

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
        this.bioimpedancia = response[0];
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
        this.bioimpedancia = response[0]
        this.busy = false;
      },
      error: () => {
        this.busy = false;
      }
    })
  }


  getUser() {
    this.busyUser = true;
    this.userService.getUserByEmail().subscribe({
      next: (response) => {
        this.user = response[0];
        console.log(response)
        this.busyUser = false;
      },
      error: () => {
        this.busyUser = false;
      }
    })
  }

}
