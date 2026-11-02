import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { POLES } from '../../../../core/navigation/navigation.data';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, Icon],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly poles = POLES;
}
