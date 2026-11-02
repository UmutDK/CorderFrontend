import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Hero } from './sections/hero/hero';
import { QuickTasks } from './sections/quick-tasks/quick-tasks';
import { AboutPoles } from './sections/about-poles/about-poles';
import { News } from './sections/news/news';
import { Agenda } from './sections/agenda/agenda';
import { Faq } from './sections/faq/faq';
import { Newsletter } from './sections/newsletter/newsletter';
import { Contact } from '../../shared/sections/contact/contact';

@Component({
  selector: 'app-home',
  imports: [Hero, QuickTasks, AboutPoles, News, Agenda, Faq, Newsletter, Contact],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    <app-quick-tasks />
    <app-about-poles />
    <app-news />
    <app-agenda />
    <app-faq />
    <app-newsletter />
    <app-contact />
  `,
})
export class Home {}
