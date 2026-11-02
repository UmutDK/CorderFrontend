import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon, IconName } from '../icon/icon';
import { Article } from '../../../core/models/article';
import { POLES } from '../../../core/navigation/navigation.data';

/** Carte d'actualité : image (ou aplat coloré du pôle), catégorie, date, titre, résumé. */
@Component({
  selector: 'app-article-card',
  imports: [RouterLink, DatePipe, Icon],
  templateUrl: './article-card.html',
  styleUrl: './article-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-accent]': 'article().pole', '[class.is-featured]': 'featured()' },
})
export class ArticleCard {
  readonly article = input.required<Article>();
  /** Grande carte horizontale (article à la une) */
  readonly featured = input(false);

  /** Icône du pôle, affichée quand l'article n'a pas d'image */
  protected readonly icon = computed<IconName>(() => {
    const pole = this.article().pole;
    if (pole === 'formation') return 'graduation-cap'; // pas un pôle du menu, mais une couleur du site
    return POLES.find((p) => p.accent === pole)?.icon ?? 'file-text';
  });
}
