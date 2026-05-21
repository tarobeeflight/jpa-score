import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Team } from '../../types/team.type';
import { ApiService } from '../../service/api-service';
import { Match } from '../../types/match.type';
import { DateUtil } from '../../utils/date.util';

@Component({
  selector: 'app-match-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './match-dialog.html',
  styleUrl: './match-dialog.scss',
})
export class MatchDialog implements OnInit {
  // フォームデータ
  matchData = {
    date: new Date().toISOString().substring(0, 10), // 本日の日付
    type: 'JPA', // 一旦JPA固定
    homeTeamId: '',
    visitorTeamId: ''
  };

  // チームプルダウン
  teams: { id: string; name: string }[] = [];

  constructor(public dialogRef: MatDialogRef<MatchDialog>, private apiSvc: ApiService) {}

  ngOnInit() {
    // チーム情報の取得
    this.apiSvc.get<Team[]>('team/list').subscribe(teams => {
      this.teams = teams.map(team => ({ id: team.teamId, name: team.teamNm }));
    });
  }

  onSave() {
    // todo : 入力チェック

    // フォームデータをMatch型に変換
    const match: Partial<Match> = {
      matchDay:  DateUtil.toDate(this.matchData.date, 'yyyy-MM-dd'),
      homeTeamId: this.matchData.homeTeamId,
      visitorTeamId: this.matchData.visitorTeamId,
    };
    // データを親コンポーネントに渡してダイアログを閉じる 
    this.dialogRef.close(match);
  }

  onCancel() {
    // ダイアログを閉じる
    this.dialogRef.close();
  }
}