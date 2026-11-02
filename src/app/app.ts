import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Racine : le cadre (site public ou administration) est choisi par les routes */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
