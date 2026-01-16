import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { GameService } from 'src/game/game.service';
import { CronTransactionWallet } from 'src/ton-wallet/cron-transaction.wallet';
import { TonPriceService } from 'src/ton-wallet/ton-price.service';

@Injectable()
export class CronProgramService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private gameService: GameService,
    private tonPriceService: TonPriceService,
    private cronTransactionWallet: CronTransactionWallet,
  ) {}

  async addCronJob() {
    // const getTonPrice = new CronJob(
    //   `0 0-23/1 * * *`,
    //   async () => {
    //     await this.tonPriceService.getTonToUsdRate();
    //   },
    //   null, // onComplete
    //   false, // start
    //   'UTC', // timeZone
    // );

    const onProcessTxTon = new CronJob(
      `*/10 * * * * *`,
      async () => {
        await this.cronTransactionWallet.onProcess();
      },
      null, // onComplete
      false, // start
      'UTC', // timeZone
    );

    const onProcessJetton = new CronJob(
      `*/10 * * * * *`,
      async () => {
        await this.cronTransactionWallet.onProcessJetton();
      },
      null, // onComplete
      false, // start
      'UTC', // timeZone
    );

    const endGame = new CronJob(
      `*/5 * * * * *`,
      async () => {
        await this.gameService.cancelGame();

        await this.gameService.endGame();
      },
      null, // onComplete
      false, // start
      'UTC', // timeZone
    );

    const botJoinGame = new CronJob(
      `* * * * * *`,
      async () => {
        await this.gameService.botJoinGame();
      },
      null, // onComplete
      false, // start
      'UTC', // timeZone
    );

    const botAttackGame = new CronJob(
      `*/5 * * * * *`,
      async () => {
        await this.gameService.botAttackGame();
      },
      null, // onComplete
      false, // start
      'UTC', // timeZone
    );

    const shareReward = new CronJob(
      `*/30 * * * * *`,
      async () => {
        await this.gameService.shareReward();
      },
      null, // onComplete
      false, // start
      'UTC', // timeZone
    );

    // this.schedulerRegistry.addCronJob('getTonPrice', getTonPrice);
    this.schedulerRegistry.addCronJob('onProcessTxTon', onProcessTxTon);
    this.schedulerRegistry.addCronJob('onProcessJetton', onProcessJetton);
    this.schedulerRegistry.addCronJob('endGame', endGame);
    this.schedulerRegistry.addCronJob('botJoinGame', botJoinGame);
    this.schedulerRegistry.addCronJob('botAttackGame', botAttackGame);
    this.schedulerRegistry.addCronJob('shareReward', shareReward);
    // getTonPrice.start();
    onProcessTxTon.start();
    onProcessJetton.start();
    endGame.start();
    botJoinGame.start();
    botAttackGame.start();
    shareReward.start();
  }
}
