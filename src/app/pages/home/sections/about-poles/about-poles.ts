import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../../../shared/ui/icon/icon';
import { Accent, POLES } from '../../../../core/navigation/navigation.data';
import { ContentService } from '../../../../core/services/content.service';
import { loadState } from '../../../../core/api/load-state';

// Public de chaque pôle : ce qui distingue cette liste des cartes du méga-menu
// TODO : formulations proposées, à faire valider par Corder
const AUDIENCES: Record<Accent, string> = {
  clinique: 'Agriculteurs, maraîchers, horticulteurs et particuliers',
  crp: 'Utilisateurs professionnels, communes et grand public',
  phytolicence: 'Détenteurs et futurs détenteurs d’une phytolicence',
  recherche: 'Partenaires scientifiques et secteur agricole',
  formation: 'Professionnels et citoyens',
};

const POLE_ROWS = POLES.map((pole) => ({ ...pole, audience: AUDIENCES[pole.accent!] }));


@Component({
  selector: 'app-about-poles',
  imports: [RouterLink, Icon],
  templateUrl: './about-poles.html',
  styleUrl: './about-poles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPoles {
  // Chiffres clés : GET /key-figures (provisoires dans public/data, TODO vrais chiffres Corder)
  protected readonly stats = loadState(inject(ContentService).keyFigures());
  protected readonly poles = POLE_ROWS;
}
