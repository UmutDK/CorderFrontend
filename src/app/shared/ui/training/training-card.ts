import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../icon/icon';
import { Training } from '../../../core/models/training';

// Au-dessous de ce seuil, on affiche « Plus que X places »
const FEW_SEATS = 5;

/** Une formation de l'agenda : date, type, lieu, horaire, prix, places, inscription. */
@Component({
  selector: 'app-training-card',
  imports: [RouterLink, DatePipe, CurrencyPipe, Icon],
  templateUrl: './training-card.html',
  styleUrl: './training-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-full]': 'training().seatsLeft === 0' },
})
export class TrainingCard {
  readonly training = input.required<Training>();

  protected readonly fewSeats = FEW_SEATS;
}
