import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { TrainingCard } from './training-card';
import { Training } from '../../../core/models/training';

/** Frise de formations regroupées par mois (les formations doivent être triées par date). */
@Component({
  selector: 'app-training-timeline',
  imports: [DatePipe, TrainingCard],
  template: `
    @for (month of months(); track month.key) {
      <div class="month">
        <h3 class="month__label">{{ month.date | date: 'MMMM y' }}</h3>
        <ul class="events">
          @for (t of month.items; track t.id) {
            <li><app-training-card [training]="t" /></li>
          }
        </ul>
      </div>
    }
  `,
  styleUrl: './training-timeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingTimeline {
  readonly trainings = input.required<Training[]>();

  /** Clé AAAA-MM → formations du mois */
  protected readonly months = computed(() => {
    const groups = new Map<string, Training[]>();
    for (const t of this.trainings()) {
      const key = t.startsAt.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), t]);
    }
    return [...groups].map(([key, items]) => ({ key, date: `${key}-01`, items }));
  });
}
