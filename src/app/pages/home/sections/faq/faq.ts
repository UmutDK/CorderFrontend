import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { ContentService } from '../../../../core/services/content.service';
import { loadState } from '../../../../core/api/load-state';

@Component({
  selector: 'app-faq',
  imports: [RouterLink, Icon],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Faq {
  protected readonly state = loadState(inject(ContentService).faq());
}
