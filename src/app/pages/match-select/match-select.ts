import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SocketService } from '../../service/socket-service';
import { Match } from '../../types/match.type';
import { ApiService } from '../../service/api-service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatchDialog } from '../match-dialog/match-dialog';
import { GameStatus } from '../../constants';

@Component({
  selector: 'app-match-select',
  imports: [MatIconModule, CommonModule],
  templateUrl: './match-select.html',
  styleUrl: './match-select.scss',
})
export class MatchSelect implements OnInit {
  // 現在開いている試合のIDを保持する変数
  openedMatchId: string | null = null;
  matches = signal<Match[]>([]);


  constructor(
    private router: Router,
    private location: Location,
    private apiSvc: ApiService,
    private socketSvc: SocketService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    // 試合情報の取得
    this.apiSvc.get<Match[]>('match/list').subscribe(matches => {
      this.matches.set(matches);
    });

    // 試合一覧ルームに参加
    this.socketSvc.emit('join-match-list', '');

    // 対戦画面での更新を購読
    this.socketSvc.on<Match>('match-list-broadcast').subscribe((match: Match) => {
      if (this.matches().some(m => m.matchId === match.matchId)) {
        // サーバーから受け取った試合が既存の場合、その試合を更新する
        this.matches.update(matches => matches.map(m => (m.matchId === match.matchId ? { ...m, ...match } : m)));
      } else {
        // 既存でない場合、その試合を追加する
        this.matches.update(matches => [...matches, match]);
      }
    });
  }

  // 詳細の表示・非表示を切り替える
  toggleDetail(matchId: string) {
    if (this.openedMatchId === matchId) {
      // 既に開いているものをクリックしたら閉じる
      this.openedMatchId = null;
    } else {
      // クリックしたIDを開く
      this.openedMatchId = matchId;
    }
  }

  nextPage(matchId: string, gameNo: number) {
    // クリックした対戦の情報を取得
    const game = this.matches().find(m => m.matchId === matchId)?.gameList.find(g => g.gameNo === gameNo);
    if (game && game.gameStatus === GameStatus.CREATED) {
      // 対戦ステータスが作成済の場合、プレイヤー登録画面に遷移
      this.router.navigate(['/player-info', matchId, gameNo]);
    } else if (game && (game.gameStatus === GameStatus.PLAYER_REGISTERED || game.gameStatus === GameStatus.FINISHED)) {
      // 対戦ステータスがプレイヤー入力済、試合終了の場合、対戦画面に遷移
      this.router.navigate(['/jpa-match', matchId, gameNo]);
    }
  }

  goBack() {
    this.location.back();
  }

  openMatchDialog() {
    const dialogRef = this.dialog.open(MatchDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(match => {
      if (!match) {
        // キャンセルボタンでクローズした場合、終了
        return;
      }

      // 確定が押された場合
      // 試合データを作成
      this.apiSvc.post('match/create', match as Partial<Match>).subscribe();
    });
  }
}
