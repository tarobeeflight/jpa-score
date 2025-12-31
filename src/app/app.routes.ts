import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { PlayerInfo } from './pages/player-info/player-info';
import { JpaMatch } from './pages/jpa-match/jpa-match';

export const routes: Routes = [
    {path: 'home', component: Home },
    {path: 'player-info', component: PlayerInfo },
    {path: 'jpa-match', component: JpaMatch },
    {path: '**', redirectTo: 'home' }
];
