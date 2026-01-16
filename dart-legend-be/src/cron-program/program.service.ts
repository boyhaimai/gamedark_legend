import { CronProgram } from './cron.program';
import { CronProgramService } from './cron-program.service';

class Program extends CronProgram {
  private cronProgramService: CronProgramService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.cronProgramService =
      await this.app.get<CronProgramService>(CronProgramService);
  }

  protected async process(): Promise<void> {
    try {
      await this.cronProgramService.addCronJob();
    } catch (err) {
      console.error(`ERROR_CRON_JOB`, err);
    }
  }
}

new Program()
  .main()
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });
