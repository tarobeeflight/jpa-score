import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { PlayerInfo } from './pages/player-info/player-info';
import { JpaMatch } from './pages/jpa-match/jpa-match';
import { MatchSelect } from './pages/match-select/match-select';

export const routes: Routes = [
    {path: 'home', component: Home },
    {path: 'match-select', component: MatchSelect },
    {path: 'player-info/:matchId/:gameNo', component: PlayerInfo },
    {path: 'jpa-match/:matchId/:gameNo', component: JpaMatch },
    {path: '**', redirectTo: 'home' }
];
