import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

export abstract class CronProgram {
  protected app: INestApplicationContext;

  async main() {
    try {
      await this.initialize();
      await this.process();
    } catch (err) {
      console.error(err);
    }
  }

  protected async initialize() {
    this.app = await NestFactory.createApplicationContext(AppModule);
  }

  protected abstract process(): Promise<void>;
}
