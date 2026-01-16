// import { Injectable } from '@nestjs/common';
// import { CronProgram } from '../cronjob/cron.program';
// import { CronTransactionWallet } from './cron-transaction.wallet';
// import { CronjobService } from 'src/cronjob/cronjob.service';

// @Injectable()
// export class CronTransactionProgramWallet extends CronProgram {
//   private cronTransactionService: CronTransactionWallet;
//   private cronService: CronjobService;

//   protected async initialize(): Promise<void> {
//     await super.initialize();

//     this.cronTransactionService = this.app.get<CronTransactionWallet>(
//       CronTransactionWallet,
//     );

//     this.cronService = this.app.get<CronjobService>(CronjobService);
//   }

//   protected async process(): Promise<void> {
//     // console.log('------------------PROCESSING------------------');
//     await this.cronTransactionService.addCronJob();
//     // console.log('------------------COMPLETED------------------');
//     // await this.cronService.updateDataClan();
//     // console.log('------------------COMPLETED_CLAN------------------');
//   }
// }

// new CronTransactionProgramWallet()
//   .main()
//   .then(() => {
//     // process.exit(0);
//   })
//   .catch((err) => {
//     console.log(err);
//     process.exit(err.code || -1);
//   });
