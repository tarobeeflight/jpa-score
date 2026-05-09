import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../service/api-service';
import { Game } from '../../types/game.type';
import { HomeKbn } from '../../constants';

@Component({
  selector: 'app-finish-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './finish-dialog.html',
  styleUrl: './finish-dialog.scss',
})
export class FinishDialog implements OnInit {

  game!: Game;
  HomeKbn = HomeKbn;

  constructor(
    public dialogRef: MatDialogRef<FinishDialog>, 
    private apiSvc: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: { game: Game }
  ) { }

  ngOnInit() {
    this.game = this.data.game;
  }

  onSave() {
    // ダイアログを閉じる 
    this.dialogRef.close(true);
  }

  onCancel() {
    // ダイアログを閉じる
    this.dialogRef.close(false);
  }
}