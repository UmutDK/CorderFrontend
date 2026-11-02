import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteHeader } from './core/layout/site-header/site-header';
import { SiteFooter } from './core/layout/site-footer/site-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
