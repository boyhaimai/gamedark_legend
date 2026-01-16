import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ConfigModel, {
  Config,
  ConfigKey,
} from 'src/database/models/config.model';

@Injectable()
export class TonPriceService implements OnModuleInit {
  private readonly logger = new Logger(TonPriceService.name);
  private readonly coinGeckoApi =
    'https://api.coingecko.com/api/v3/simple/price';

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(ConfigModel.collection.name)
    private configModel: Model<Config>,
  ) {}

  async onModuleInit() {
    const config = await this.configModel.findOne({
      key: ConfigKey.TON_PRICE,
    });
    const configSGC = await this.configModel.findOne({
      key: ConfigKey.SGC_PRICE,
    });
    if (!configSGC) {
      await this.configModel.create({
        key: ConfigKey.SGC_PRICE,
        value: 1,
      });
    }
    if (!config) {
      await this.configModel.create({
        key: ConfigKey.TON_PRICE,
        value: 1,
      });
    }
  }

  // @Cron(CronExpression.EVERY_HOUR)
  // async getTonToUsdRate(): Promise<{ price: number } | null> {
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(this.coinGeckoApi, {
  //         headers: {
  //           'x-cg-demo-api-key': process.env.API_KEY_COINGECKO,
  //         },
  //         params: {
  //           ids: 'the-open-network',
  //           vs_currencies: 'usd',
  //         },
  //       }),
  //     );
  //     const price = response?.data?.['the-open-network']?.usd;
  //     if (price) {
  //       await this.configModel.findOneAndUpdate(
  //         { key: ConfigKey.TON_PRICE },
  //         { $set: { value: price } },
  //         { upsert: true },
  //       );
  //     }

  //     return {
  //       price,
  //     };
  //   } catch (error) {
  //     this.logger.error('Failed to fetch TON to USD rate', error);
  //     return null;
  //   }
  // }

  async getTonPrice() {
    const config = await this.configModel.findOne({
      key: ConfigKey.TON_PRICE,
    });
    return config;
  }
}
