import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../shared/ui/icon/icon';
import {
  CONTACT,
  FOOTER_NAV,
  LEGAL_LINKS,
  POLES,
  SOCIAL_LINKS,
} from '../../navigation/navigation.data';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, Icon],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly nav = FOOTER_NAV;
  protected readonly poles = POLES;
  protected readonly legal = LEGAL_LINKS;
  protected readonly social = SOCIAL_LINKS;
  protected readonly contact = CONTACT;
  protected readonly year = new Date().getFullYear();
}
