/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Bot, GrammyError, HttpError } from 'grammy';
import { ConfigService } from '@nestjs/config';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { UserService } from 'src/user/user.service';
import { User } from 'src/database/models/user.model';
import { TonService } from 'src/ton-wallet/ton.service';
import { TonWalletService } from 'src/ton-wallet/ton-wallet.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OrderModel, { Order } from 'src/database/models/order.model';
import WalletTransactionModel, {
  WalletTransaction,
} from 'src/database/models/walletTransaction.model';
import SaleConfigModel from 'src/database/models/sale-config.model';
import { NftService } from 'src/nft/services/nft.service';
import { NFTType } from 'src/database/models/NFT.model';
import { MintNftService } from 'src/nft/services/mint-nft.service';
import { WalletTransactionType } from 'src/database/models/walletTransaction.model';

@Injectable()
export class BotTeleService {
  public bot: TelegramBot;
  private grammy: Bot;
  // Persist admin mint context per chat
  private mintContextByChat: Map<
    number,
    { nftType?: string; quantity?: number }
  > = new Map();
  private pendingSearchByChat: Map<
    number,
    | 'transactions'
    | 'user_setbot'
    | 'sale_time'
    | 'sale_time_end'
    | 'sale_discount'
    | 'mint_nft_type'
    | 'mint_nft_quantity'
    | 'mint_nft_wallets'
  > = new Map();

  constructor(
    private configService: ConfigService,
    private readonly userService: UserService,
    private readonly tonService: TonService,
    @Inject(forwardRef(() => TonWalletService))
    private readonly tonWalletService: TonWalletService,
    @InjectModel(OrderModel.collection.name)
    private orderModel: Model<Order>,
    @InjectModel(WalletTransactionModel.collection.name)
    private walletTransactionModel: Model<WalletTransaction>,
    @InjectModel(SaleConfigModel.collection.name)
    private saleConfigModel: Model<any>,
    private readonly nftService: NftService,
    private readonly mintNftService: MintNftService,
  ) {
    if (process.env.LOCAL !== 'LOCAL') {
      const token = this.configService.getOrThrow<string>(
        'TELEGRAM_BOT_API_KEY',
      );

      this.bot = new TelegramBot(token, { polling: true });
      this.grammy = new Bot(token);
    }
  }

  private async performUserSearchSetBot(chatId: number, query: string) {
    try {
      const normalized = query.trim();
      if (!normalized || normalized.length < 2) {
        await this.bot.sendMessage(
          chatId,
          '❌ Username must be at least 2 characters.',
        );
        return;
      }

      const users = await this.userService['userModel']
        .find({
          username: { $regex: normalized, $options: 'i' },
          is_bot: false,
        })
        .sort({ createdAt: -1 })
        .limit(10);

      let message = `🔍 <b>Results for "${normalized}"</b>\n\n`;

      if (users.length === 0) {
        message += '📭 No users found';
      } else {
        users.forEach((u, i) => {
          message += `${i + 1}. 👤 ${u.username || 'No username'} (${u.code || 'No code'})\n`;
        });
      }

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            ...users.map((u) => [
              {
                text: `👤 ${u.username || 'User'} - Set Bot`,
                callback_data: `admin_setbot_${u.code || u.username}`,
              },
            ]),
            [
              { text: '🔍 New Search', callback_data: 'admin_setbot_search' },
              { text: '🔙 Admin Panel', callback_data: 'admin_back' },
            ],
          ],
        },
      };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Error searching users');
    }
  }

  private async updateSaleTime(
    chatId: number,
    input: string,
    which: 'start' | 'end',
  ) {
    try {
      let sale = await this.saleConfigModel.findOne();
      if (!sale)
        sale = await this.saleConfigModel.create({ discountPercent: 0 });

      if (input.toLowerCase() === 'clear') {
        if (which === 'start') sale.saleStartAt = null;
        else sale.saleEndAt = null;
      } else {
        // Expect format YYYY-MM-DD HH:mm
        const normalized = input.replace('T', ' ');
        const parsed = new Date(normalized);
        if (isNaN(parsed.getTime())) {
          await this.bot.sendMessage(
            chatId,
            '❌ Invalid time format. Use YYYY-MM-DD HH:mm or send "clear".',
          );
          return;
        }
        if (which === 'start') sale.saleStartAt = parsed;
        else sale.saleEndAt = parsed;
      }

      await sale.save();
      await this.bot.sendMessage(chatId, `✅ Sale ${which} time updated.`);
      await this.showAdminSaleTimeForm(chatId);
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Failed to update sale time');
    }
  }

  private async updateSaleDiscount(chatId: number, input: string) {
    try {
      const percent = Number(input);
      if (!isFinite(percent) || percent < 0 || percent > 100) {
        await this.bot.sendMessage(
          chatId,
          '❌ Invalid percent. Enter a number between 0 and 100.',
        );
        return;
      }

      let sale = await this.saleConfigModel.findOne();
      if (!sale)
        sale = await this.saleConfigModel.create({ discountPercent: 0 });
      sale.discountPercent = Math.round(percent);
      await sale.save();
      await this.bot.sendMessage(chatId, '✅ Discount percent updated.');
      await this.showAdminSaleTimeForm(chatId);
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to update discount percent',
      );
    }
  }
  async onModuleInit() {
    if (process.env.LOCAL == 'LOCAL') {
      return;
    }

    await this.grammy.init();

    this.grammy.api
      .setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: '🕹️ Open',
          web_app: {
            url: this.configService.getOrThrow<string>('CLIENT_URL'),
          },
        },
      })
      .catch((err) => {
        const ctx = err.ctx;
        console.log(`Error while handling update ${ctx?.update?.update_id}:`);
        const e = err.error;
        if (e instanceof GrammyError) {
          console.log('Error in request:', e.description);
        } else if (e instanceof HttpError) {
          console.log('Could not contact Telegram:', e);
        } else {
          console.log('Unknown error:', e);
        }
      });

    this.grammy.api
      .setMyCommands([
        { command: 'start', description: 'Open main menu' },
        { command: 'clear', description: 'Clear chat context' },
        { command: 'admin', description: 'Admin panel (Admin only)' },
      ])
      .catch((err) => {
        const ctx = err.ctx;
        console.log(`Error while handling update ${ctx?.update?.update_id}:`);
        const e = err.error;
        if (e instanceof GrammyError) {
          console.log('Error in request:', e.description);
        } else if (e instanceof HttpError) {
          console.log('Could not contact Telegram:', e);
        } else {
          console.log('Unknown error:', e);
        }
      });

    // this.bot.on('message', this.onReceivedMessage.bind(this));

    this.bot.onText(/\/start (.+)|\/start/i, async (message, match) => {
      if (match[1]) {
        try {
          const data = {
            userId: message.from.id,
            username: message.from.username,
            is_premium: message.from?.['is_premium'] || false,
            avatar: message.from?.['photo_url'] || null,
          } as User;

          // @ts-expect-error
          await this.userService.botUser({
            ...data,
            referrerCode: match[1],
            first_name: message?.from.first_name,
            last_name: message?.from.last_name,
          });
        } catch (error) {
          console.log('bot text match error:', error.message);
        }
        this.sendMenu(message.chat.id);
      } else {
        try {
          const data = {
            userId: message.from.id,
            username: message.from.username,
            is_premium: message.from?.['is_premium'] || false,
            avatar: message.from?.['photo_url'] || null,
          } as User;
          // @ts-expect-error
          await this.userService.botUser({
            ...data,
            first_name: message?.from.first_name,
            last_name: message?.from.last_name,
          });
        } catch (error) {
          console.log('bot start error:', error.message);
        }
        this.sendMenu(message.chat.id);
      }
    });

    this.bot.onText(/\/clear/, async (message: TelegramBot.Message) => {
      this.cleanMessageChat(message);
    });

    // Admin commands
    this.bot.onText(/\/admin/, async (message: TelegramBot.Message) => {
      await this.handleAdminCommand(message);
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      try {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        if (data.startsWith('admin_')) {
          await this.handleAdminCallback(callbackQuery);
        } else {
          this.sendMenu(chatId);
        }
      } catch (error) {
        console.log('error_callback_query', error);
      }
    });

    // Handle plain text for search flows (no slash commands required)
    this.bot.on('message', async (message: TelegramBot.Message) => {
      try {
        if (!message.text) return;
        // Ignore bot commands
        if (message.text.startsWith('/')) return;

        const chatId = message.chat.id;
        const pending = this.pendingSearchByChat.get(chatId);
        if (!pending) return;
        // Debug trace for pending state
        console.log('telegram_text_received', {
          chatId,
          pending,
          preview: message.text.slice(0, 60),
        });
        // Optional lightweight feedback in chat for wallet input
        if (pending === 'mint_nft_wallets') {
          await this.bot.sendChatAction(chatId, 'typing');
        }

        if (pending === 'transactions') {
          await this.performTransactionsSearch(chatId, message.text.trim());
          this.pendingSearchByChat.delete(chatId);
        } else if (pending === 'user_setbot') {
          await this.performUserSearchSetBot(chatId, message.text.trim());
          this.pendingSearchByChat.delete(chatId);
          // } else if (pending === 'sale_time') {
          //   await this.updateSaleTime(chatId, message.text.trim(), 'start');
          //   this.pendingSearchByChat.delete(chatId);
          // } else if (pending === 'sale_time_end') {
          //   await this.updateSaleTime(chatId, message.text.trim(), 'end');
          //   this.pendingSearchByChat.delete(chatId);
          // } else if (pending === 'sale_discount') {
          //   await this.updateSaleDiscount(chatId, message.text.trim());
          //   this.pendingSearchByChat.delete(chatId);
        } else if (pending === 'mint_nft_type') {
          // Do not delete pending here; selectNftType will advance to next stage
          await this.handleMintNftTypeSelection(chatId, message.text.trim());
        } else if (pending === 'mint_nft_quantity') {
          // Do not delete pending here; next stage expects 'mint_nft_wallets'
          await this.handleMintNftQuantityInput(chatId, message.text.trim());
        } else if (pending === 'mint_nft_wallets') {
          await this.handleMintNftWalletsInput(chatId, message.text.trim());
          this.pendingSearchByChat.delete(chatId);
        }
      } catch (error) {
        console.log('error_message_handler', error);
      }
    });
  }

  public cleanMessageChat(message: TelegramBot.Message) {
    for (let i = 0; i < 100; i++) {
      this.bot
        .deleteMessage(message.chat.id, message.message_id + 50 - i)
        .catch(() => {
          return;
        });
    }
    this.mainMenuChat(message);
  }

  async mainMenuChat(message: TelegramBot.Message) {
    try {
      const data = {
        userId: message.from.id,
        username: message.from.username,
        is_premium: message.from?.['is_premium'] || false,
        avatar: message.from?.['photo_url'] || null,
      } as User;

      // @ts-ignore
      await this.userService.botUser({
        ...data,
        first_name: message?.from.first_name,
        last_name: message?.from.last_name,
      });
    } catch (error) {
      console.log('main menu error', error.message);
    }
    this.sendMenu(message.chat.id);
  }

  async sendMenu(id: number) {
    const url = this.configService.getOrThrow<string>('CLIENT_URL');

    return this.bot.sendMessage(id, `🌟 Welcome to Dart Legends Game🌟`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              web_app: { url },
              text: 'Start App',
            },
          ],
          [
            {
              text: 'Join Community',
              url: this.configService.getOrThrow<string>('TELEGRAM_GROUP_URL'),
            },
          ],
        ],
      },
    });
  }

  private async isAdmin(userId: number) {
    const user = await this.userService.findAdmin(userId);
    return user?.role === 'admin';
  }

  private async handleAdminCommand(message: TelegramBot.Message) {
    const isAdmin = await this.isAdmin(message.from.id);
    if (!isAdmin) {
      this.bot.sendMessage(
        message.chat.id,
        '🚫 You do not have permission to access this command.',
      );
      return;
    }

    const adminMenu = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '👥 Users List', callback_data: 'admin_users' },
            { text: '💰 Master Balance', callback_data: 'admin_balance' },
          ],
          [
            { text: '📊 Transactions', callback_data: 'admin_transactions' },
            { text: '📈 Statistics', callback_data: 'admin_stats' },
          ],
          [
            { text: '🤖 Set Bot', callback_data: 'admin_setbot' },
            { text: '❌ Unset Bot', callback_data: 'admin_unbot' },
          ],
          [
            // { text: '🕒 Sale Time', callback_data: 'admin_sale_time' },
            { text: '🎨 Mint NFT', callback_data: 'admin_mint_nft' },
          ],
        ],
      },
    };

    this.bot.sendMessage(
      message.chat.id,
      '🔐 <b>Admin Panel</b>\n\nSelect an option:',
      { parse_mode: 'HTML', ...adminMenu },
    );
  }

  private async handleAdminCallback(callbackQuery: TelegramBot.CallbackQuery) {
    const isAdmin = await this.isAdmin(callbackQuery.from.id);
    if (!isAdmin) {
      this.bot.answerCallbackQuery(callbackQuery.id, {
        text: '🚫 You do not have permission to access this command.',
        show_alert: true,
      });
      return;
    }
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    switch (data) {
      case 'admin_users':
        await this.showUsersList(chatId, 1);
        break;
      case 'admin_balance':
        await this.showMasterBalance(chatId);
        break;
      case 'admin_transactions':
        await this.showTransactions(chatId);
        break;
      case 'admin_tx_search':
        this.pendingSearchByChat.set(chatId, 'transactions');
        await this.bot.sendMessage(
          chatId,
          '🔍 Enter search text for transactions (username, hash, or type: deposit/withdraw).',
        );
        break;
      case 'admin_stats':
        await this.showStatistics(chatId);
        break;
      case 'admin_setbot':
        await this.showSetBotForm(chatId);
        break;
      case 'admin_setbot_search':
        this.pendingSearchByChat.set(chatId, 'user_setbot');
        await this.bot.sendMessage(
          chatId,
          '🔍 Enter a username to search and set as bot.',
        );
        break;
      case 'admin_unbot':
        await this.showUnsetBotForm(chatId);
        break;
      // case 'admin_sale_time':
      //   await this.showAdminSaleTimeForm(chatId);
      //   break;
      // case 'admin_sale_time_start':
      //   this.pendingSearchByChat.set(chatId, 'sale_time');
      //   await this.bot.sendMessage(
      //     chatId,
      //     '🕒 Enter new sale START time (YYYY-MM-DD HH:mm), or "clear" to unset.',
      //   );
      //   break;
      // case 'admin_sale_time_end':
      //   this.pendingSearchByChat.set(chatId, 'sale_time_end');
      //   await this.bot.sendMessage(
      //     chatId,
      //     '⏳ Enter new sale END time (YYYY-MM-DD HH:mm), or "clear" to unset.',
      //   );
      //   break;
      // case 'admin_sale_discount_set':
      //   this.pendingSearchByChat.set(chatId, 'sale_discount');
      //   await this.bot.sendMessage(
      //     chatId,
      //     '％ Enter discount percent (0-100).',
      //   );
      //   break;
      case 'admin_mint_nft':
        await this.showMintNftTypeSelection(chatId);
        break;
      case 'admin_back':
        await this.handleAdminCommand({ chat: { id: chatId } } as any);
        break;
      default:
        // Handle pagination callbacks
        if (data.startsWith('admin_users_page_')) {
          const page = parseInt(data.split('_')[3]);
          if (!isNaN(page)) {
            await this.showUsersList(chatId, page);
          }
        }
        // Handle setbot/unbot callbacks
        else if (data.startsWith('admin_setbot_')) {
          const code = data.split('_')[2];
          await this.adminSetBot(chatId, code);
        } else if (data.startsWith('admin_unbot_')) {
          const code = data.split('_')[2];
          await this.adminUnBot(chatId, code);
        } else if (data.startsWith('admin_mint_nft_type_')) {
          const nftType = data.split('_')[4];
          await this.selectNftType(chatId, nftType);
        }
        break;
    }
  }

  private async showUsersList(chatId: number, page: number = 1) {
    try {
      const pageSize = 10; // Số users hiển thị mỗi trang
      const skip = (page - 1) * pageSize;

      // Get users with pagination
      const users = await this.userService['userModel']
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      const totalUsers = await this.userService['userModel'].countDocuments();
      const botUsers = await this.userService['userModel'].countDocuments({
        is_bot: true,
      });
      const adminUsers = await this.userService['userModel'].countDocuments({
        role: 'admin',
      });

      const totalPages = Math.ceil(totalUsers / pageSize);
      const startUser = skip + 1;
      const endUser = Math.min(skip + pageSize, totalUsers);

      let message = `👥 <b>Users Overview</b>\n\n`;
      message += `📊 <b>Total Users:</b> ${totalUsers}\n`;
      message += `🤖 <b>Bot Users:</b> ${botUsers}\n`;
      message += `👑 <b>Admin Users:</b> ${adminUsers}\n\n`;
      message += `📋 <b>Users (${startUser}-${endUser} of ${totalUsers})</b>\n`;
      message += `📄 <b>Page:</b> ${page}/${totalPages}\n\n`;

      if (users.length === 0) {
        message += `📭 No users found on this page`;
      } else {
        users.forEach((user, index) => {
          const username = user.username || 'No username';
          const isBot = user.is_bot ? '🤖' : '👤';
          const isAdmin = user.role === 'admin' ? '👑' : '';
          const userNumber = startUser + index;
          message += `${userNumber}. ${isBot} ${username} ${isAdmin}\n`;
        });
      }

      // Create pagination buttons
      const paginationButtons = [];

      if (totalPages > 1) {
        const row = [];

        // Previous page button
        if (page > 1) {
          row.push({
            text: '⬅️ Prev Page',
            callback_data: `admin_users_page_${page - 1}`,
          });
        }

        // Next page button
        if (page < totalPages) {
          row.push({
            text: 'Next Page ➡️',
            callback_data: `admin_users_page_${page + 1}`,
          });
        }

        if (row.length > 0) {
          paginationButtons.push(row);
        }
      }

      // Add back button
      paginationButtons.push([
        { text: '🔙 Back to Admin Panel', callback_data: 'admin_back' },
      ]);

      const keyboard = {
        reply_markup: {
          inline_keyboard: paginationButtons,
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching users data');
    }
  }

  private async showMasterBalance(chatId: number) {
    try {
      const apiKey = process.env.TON_BOT_API_KEY;
      const mnemonic = process.env.TON_MASTER_WALLET_MNEMONIC;
      const address = this.configService.get('TON_MASTER_WALLET_ADDRESS');

      if (!apiKey) {
        await this.bot.sendMessage(
          chatId,
          '❌ TON_BOT_API_KEY is missing in env. Please set it to query TON RPC.',
        );
        return;
      }
      if (!mnemonic) {
        await this.bot.sendMessage(
          chatId,
          '❌ TON_MASTER_WALLET_MNEMONIC is missing in env. Please set 24 words.',
        );
        return;
      }
      if (!address) {
        await this.bot.sendMessage(
          chatId,
          '❌ TON_MASTER_WALLET_ADDRESS is missing in env.',
        );
        return;
      }

      const balance = await this.tonService.getBalance();
      const balanceInTon = parseFloat(balance);
      const walletAddress = await this.tonService.getWalletAddress();

      let message = `💰 <b>Master Wallet Balance</b>\n\n`;
      message += `🏦 <b>Wallet Address:</b>\n<code>${walletAddress}</code>\n\n`;
      message += `💎 <b>TON Balance:</b> ${balanceInTon.toFixed(4)} TON\n`;
      message += `⏰ <b>Last Updated:</b> ${new Date().toLocaleString()}`;

      const refreshButton = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Refresh', callback_data: 'admin_balance' }],
            [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
          ],
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...refreshButton,
      });
    } catch (error) {
      const msg = (error && (error as any).message) || String(error);
      this.bot.sendMessage(chatId, `❌ Error fetching balance data: ${msg}`);
    }
  }

  private async showTransactions(chatId: number) {
    try {
      // Get recent transactions
      const transactions = await this.walletTransactionModel
        .find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('user', 'username');

      let message = `📊 <b>Recent Transactions</b>\n\n`;

      if (transactions.length === 0) {
        message += `📭 No transactions found`;
      } else {
        transactions.forEach((tx, index) => {
          const user = tx.user as any;
          const username = user?.username || 'Unknown';
          const type =
            tx.type === 'deposit' ? '📥' : tx.type === 'withdraw' ? '📤' : '🔄';
          const status =
            tx.status === 'done' ? '✅' : tx.status === 'pending' ? '⏳' : '❌';
          const amount = tx.amount?.toFixed(4) || '0';
          const date = new Date(tx.createdAt).toLocaleDateString();

          message += `${index + 1}. ${type} ${username} - ${amount} TON ${status}\n`;
          message += `   📅 ${date} | 💰 ${tx.hash ? 'Hash: ' + tx.hash.substring(0, 8) + '...' : 'No hash'}\n\n`;
        });
      }

      const backButton = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔍 Search', callback_data: 'admin_tx_search' },
              { text: '🔄 Refresh', callback_data: 'admin_transactions' },
            ],
            [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
          ],
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...backButton,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching transactions data');
    }
  }

  private async performTransactionsSearch(chatId: number, query: string) {
    try {
      const normalized = query.toLowerCase();

      const filters: any[] = [];
      // By username (partial, case-insensitive)
      filters.push({}); // placeholder to ensure $or has at least one

      const byUsername = await this.walletTransactionModel
        .find()
        .populate('user', 'username')
        .sort({ createdAt: -1 })
        .limit(200);

      const results = byUsername
        .filter((tx: any) => {
          const username: string = tx.user?.username || '';
          const hash: string = tx.hash || '';
          const type: string = tx.type || '';
          return (
            username.toLowerCase().includes(normalized) ||
            hash.toLowerCase().includes(normalized) ||
            type.toLowerCase() === normalized
          );
        })
        .slice(0, 20);

      let message = `📊 <b>Search Transactions</b>\n\n`;
      message += `🔎 Query: <code>${query}</code>\n\n`;

      if (results.length === 0) {
        message += `📭 No matching transactions`;
      } else {
        results.forEach((tx, index) => {
          const user = tx.user as any;
          const username = user?.username || 'Unknown';
          const type =
            tx.type === 'deposit' ? '📥' : tx.type === 'withdraw' ? '📤' : '🔄';
          const status =
            tx.status === 'done' ? '✅' : tx.status === 'pending' ? '⏳' : '❌';
          const amount = tx.amount?.toFixed(4) || '0';
          const date = new Date(tx.createdAt).toLocaleDateString();
          message += `${index + 1}. ${type} ${username} - ${amount} TON ${status}\n`;
          message += `   📅 ${date} | 💰 ${tx.hash ? 'Hash: ' + tx.hash.substring(0, 8) + '...' : 'No hash'}\n\n`;
        });
      }

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔍 New Search', callback_data: 'admin_tx_search' },
              { text: '🔄 Back to List', callback_data: 'admin_transactions' },
            ],
            [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
          ],
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error searching transactions');
    }
  }

  private async showStatistics(chatId: number) {
    try {
      const totalUsers = await this.userService['userModel'].countDocuments();
      const totalBots = await this.userService['userModel'].countDocuments({
        is_bot: true,
      });
      const totalOrders = await this.orderModel.countDocuments();
      const totalTransactions =
        await this.walletTransactionModel.countDocuments();

      // Get today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = await this.orderModel.countDocuments({
        createdAt: { $gte: today },
      });
      const todayTransactions =
        await this.walletTransactionModel.countDocuments({
          createdAt: { $gte: today },
        });

      let message = `📈 <b>System Statistics</b>\n\n`;
      message += `👥 <b>Users:</b> ${totalUsers}\n`;
      message += `🤖 <b>Bots:</b> ${totalBots}\n`;
      message += `📋 <b>Orders:</b> ${totalOrders}\n`;
      message += `💸 <b>Transactions:</b> ${totalTransactions}\n\n`;
      message += `📅 <b>Today's Activity:</b>\n`;
      message += `   📋 Orders: ${todayOrders}\n`;
      message += `   💸 Transactions: ${todayTransactions}\n\n`;
      message += `⏰ <b>Last Updated:</b> ${new Date().toLocaleString()}`;

      const backButton = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
          ],
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...backButton,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching statistics data');
    }
  }

  private async showSetBotForm(chatId: number) {
    try {
      let message = `🤖 <b>Set Bot</b>\n\n`;
      message += `🔍 <b>Search user by username</b>\n`;
      message += `• Type a username in chat (no slash needed)\n`;
      message += `• I'll show matching users to set as bot\n`;

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔍 Enter Username',
                callback_data: 'admin_setbot_search',
              },
            ],
            [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
          ],
        },
      };

      this.pendingSearchByChat.set(chatId, 'user_setbot');
      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error opening set-bot form');
    }
  }

  private async showUnsetBotForm(chatId: number) {
    try {
      // Get bot users
      const botUsers = await this.userService['userModel']
        .find({ is_bot: true })
        .sort({ createdAt: -1 })
        .limit(10);

      let message = `❌ <b>Unset Bot Status</b>\n\n`;
      message += `📝 <b>Instructions:</b>\n`;
      message += `• Click on a bot below to unset bot status\n`;
      message += `• Or manually enter username/code\n\n`;
      message += `🤖 <b>Bot Users:</b>\n`;

      if (botUsers.length === 0) {
        message += `📭 No bot users found`;
      } else {
        botUsers.forEach((user, index) => {
          const username = user.username || 'No username';
          const code = user.code || 'No code';
          message += `${index + 1}. 🤖 ${username} (${code})\n`;
        });
      }

      // Create quick action buttons
      const quickButtons = [];
      botUsers.forEach((user, index) => {
        quickButtons.push({
          text: `🤖 ${user.username || 'Bot' + (index + 1)}`,
          callback_data: `admin_unbot_${user.code || user.username}`,
        });
      });

      // Group buttons in rows of 2
      const buttonRows = [];
      for (let i = 0; i < quickButtons.length; i += 2) {
        const row = quickButtons.slice(i, i + 2);
        buttonRows.push(row);
      }

      // Add back button
      buttonRows.push([
        { text: '🔙 Back to Admin Panel', callback_data: 'admin_back' },
      ]);

      const keyboard = {
        reply_markup: {
          inline_keyboard: buttonRows,
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching bot users data');
    }
  }

  async adminSetBot(id: number, key: any) {
    try {
      const user = await this.userService.adminUpdate(key, true);
      if (user) {
        this.bot.sendMessage(id, '<i>Setting bot successfully!</i>', {
          parse_mode: 'HTML',
        });
        return;
      }
      this.bot.sendMessage(id, '<i>User not found!</i>', {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.bot.sendMessage(id, '<i>Setting bot failed!</i>', {
        parse_mode: 'HTML',
      });
    }
  }

  async adminUnBot(id: number, key: any) {
    try {
      const user = await this.userService.adminUpdate(key, false);
      if (user) {
        this.bot.sendMessage(id, '<i>Unsetting bot successfully!</i>', {
          parse_mode: 'HTML',
        });
        return;
      }
      this.bot.sendMessage(id, '<i>User not found!</i>', {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.bot.sendMessage(id, '<i>Unsetting bot failed!</i>', {
        parse_mode: 'HTML',
      });
    }
  }
  private async showAdminSaleTimeForm(chatId: number) {
    try {
      let sale = await this.saleConfigModel.findOne();
      if (!sale) {
        sale = await this.saleConfigModel.create({
          saleStartAt: null,
          saleEndAt: null,
          discountPercent: 0,
        });
      }

      const saleTimeText = sale.saleStartAt
        ? new Date(sale.saleStartAt).toLocaleString()
        : 'Not set';
      const saleEndText = sale.saleEndAt
        ? new Date(sale.saleEndAt).toLocaleString()
        : 'Not set';
      const discountText = `${sale.discountPercent}%`;

      let message = `🕒 <b>Sale Settings</b>\n\n`;
      message += `• <b>Sale Start:</b> ${saleTimeText}\n`;
      message += `• <b>Sale End:</b> ${saleEndText}\n`;
      message += `• <b>Discount:</b> ${discountText}\n\n`;
      message += `✏️ <b>How to update</b>\n`;
      message += `• Set start: click "Set Start" then type YYYY-MM-DD HH:mm\n`;
      message += `• Set end: click "Set End" then type YYYY-MM-DD HH:mm\n`;
      message += `• Set discount: click "Set %" then type a number 0-100\n`;

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🕒 Set Start', callback_data: 'admin_sale_time_start' },
              { text: '⏳ Set End', callback_data: 'admin_sale_time_end' },
            ],
            [{ text: '％ Set %', callback_data: 'admin_sale_discount_set' }],
            [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
          ],
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error fetching sale time data');
    }
  }

  private async showMintNftTypeSelection(chatId: number) {
    try {
      const nfts = await this.nftService.findAll();

      let message = `🎨 <b>Mint NFT</b>\n\n`;
      message += `📋 <b>Select NFT Type:</b>\n\n`;

      if (nfts.length === 0) {
        message += `📭 No NFTs available!`;
        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
            ],
          },
        });
        return;
      }

      // Group NFTs by type
      const nftTypes = [...new Set(nfts.map((nft) => nft.type))];

      nftTypes.forEach((type, index) => {
        const typeNfts = nfts.filter((nft) => nft.type === type);
        message += `${index + 1}. 🎨 ${type.toUpperCase()} (${typeNfts.length} variants)\n`;
      });

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            ...nftTypes.map((type) => [
              {
                text: `🎨 ${type.toUpperCase()}`,
                callback_data: `admin_mint_nft_type_${type}`,
              },
            ]),
            [{ text: '🔙 Back to Admin Panel', callback_data: 'admin_back' }],
          ],
        },
      };

      this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...keyboard,
      });
    } catch (error) {
      this.bot.sendMessage(chatId, '❌ Error loading NFT types');
    }
  }

  async selectNftType(chatId: number, nftType: string) {
    try {
      // Store selected NFT type in a temporary storage (you might want to use Redis or database for production)
      const current = this.mintContextByChat.get(chatId) || {};
      this.mintContextByChat.set(chatId, {
        ...current,
        nftType: String(nftType).toLowerCase().trim(),
      });
      this.pendingSearchByChat.set(chatId, 'mint_nft_quantity');

      let message = `🎨 <b>Selected: ${nftType.toUpperCase()}</b>\n\n`;
      message += `📝 <b>Enter quantity to mint:</b>\n`;
      message += `• Enter a number (1-100)\n`;
      message += `• This will mint multiple NFTs of the same type\n`;

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to NFT Types', callback_data: 'admin_mint_nft' }],
          ],
        },
      });
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Error selecting NFT type');
    }
  }

  private async handleMintNftTypeSelection(chatId: number, input: string) {
    // This method is called when user types NFT type manually
    await this.selectNftType(chatId, input);
  }

  private async handleMintNftQuantityInput(chatId: number, input: string) {
    try {
      const quantity = parseInt(input.trim());

      if (!quantity || quantity < 1 || quantity > 50) {
        await this.bot.sendMessage(
          chatId,
          '❌ Invalid quantity. Please enter a number between 1 and 50.',
        );
        return;
      }

      const current = this.mintContextByChat.get(chatId) || {};
      this.mintContextByChat.set(chatId, {
        ...current,
        quantity,
      });

      this.pendingSearchByChat.set(chatId, 'mint_nft_wallets');

      let message = `🎨 <b>Quantity: ${quantity}</b>\n\n`;
      message += `📝 <b>Enter wallet address:</b>\n`;
      message += `• Enter a single wallet address\n`;
      message += `• This wallet will receive ${quantity} NFT${quantity > 1 ? 's' : ''}\n`;
      message += `• Example:\n`;
      message += `UQAtAU0TAWDR8v_H0yIKYw0MNQpOwF6xtD5-0hlT-oFWragf\n`;

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Quantity', callback_data: 'admin_mint_nft' }],
          ],
        },
      });
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Error processing quantity');
    }
  }

  private async handleMintNftWalletsInput(chatId: number, input: string) {
    try {
      const wallet = input.trim();
      console.log({ wallet });

      const ctx = this.mintContextByChat.get(chatId) || {};
      const { nftType, quantity } = ctx;

      if (!wallet || wallet.length === 0) {
        await this.bot.sendMessage(chatId, '❌ No wallet address provided.');
        return;
      }

      // Validate wallet address (basic validation)
      if (wallet.length < 40 || wallet.length > 60) {
        await this.bot.sendMessage(chatId, '❌ Invalid wallet address format.');
        return;
      }

      await this.bot.sendMessage(
        chatId,
        `✅ Processing wallet address...\n` +
          `🎨 Starting NFT minting process...\n` +
          `📊 Quantity: ${quantity || 1} NFT${quantity > 1 ? 's' : ''}`,
      );

      // Start minting process
      await this.processBulkMintNft(chatId, wallet, nftType, quantity);
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        `❌ Error processing wallet: ${error.message}`,
      );
    }
  }

  private async processBulkMintNft(
    chatId: number,
    wallet: string,
    nftType?: string,
    quantity?: number,
  ) {
    try {
      const nfts = await this.nftService.findAll();
      if (nfts.length === 0) {
        await this.bot.sendMessage(chatId, '❌ No NFTs available!');
        return;
      }

      const totalQuantity = quantity || 1;
      // Choose NFT type: prefer provided nftType, otherwise random
      const nftTypes = [...new Set(nfts.map((nft) => nft.type))] as NFTType[];
      const normalizedRequested = (nftType || '').toLowerCase();
      const mapLabelToEnum: Record<string, NFTType> = {
        common: NFTType.COMMON,
        rare: NFTType.RARE,
        legendary: NFTType.LEGENDARY,
      };
      const requestedEnum = mapLabelToEnum[normalizedRequested];
      const canUseRequested =
        typeof requestedEnum !== 'undefined' &&
        nftTypes.includes(requestedEnum);
      const selectedType: NFTType = canUseRequested
        ? requestedEnum
        : (nftTypes[Math.floor(Math.random() * nftTypes.length)] as NFTType);
      const selectedNfts = nfts.filter((nft) => nft.type === selectedType);
      const randomNft =
        selectedNfts[Math.floor(Math.random() * selectedNfts.length)];

      let successCount = 0;
      let failCount = 0;
      const results = [];

      await this.bot.sendMessage(
        chatId,
        `🎨 <b>Minting Started</b>\n\n` +
          `📊 <b>Quantity:</b> ${totalQuantity} NFT${totalQuantity > 1 ? 's' : ''}\n` +
          `👛 <b>Wallet:</b> ${wallet.substring(0, 10)}...${wallet.substring(wallet.length - 10)}\n` +
          `🎨 <b>NFT Type:</b> ${randomNft.name} (${selectedType})\n` +
          `⏳ <b>Status:</b> In progress...`,
        { parse_mode: 'HTML' },
      );

      for (let i = 0; i < totalQuantity; i++) {
        try {
          // Mint NFT
          const mintResult = await this.mintNftService.deployAndMint(
            randomNft.image,
          );

          if (!mintResult.success) {
            failCount++;
            results.push(`❌ NFT ${i + 1} - Mint failed`);
            continue;
          }

          // Transfer NFT to wallet
          const transferResult = await this.mintNftService.transferNFT(
            wallet,
            mintResult.itemIndex,
            randomNft.image,
          );

          if (transferResult.success) {
            successCount++;
            results.push(`✅ NFT ${i + 1} - Index: ${mintResult.itemIndex}`);
          } else {
            failCount++;
            results.push(`❌ NFT ${i + 1} - Transfer failed`);
          }

          // Send progress update every 5 NFTs
          if ((i + 1) % 5 === 0 || i === totalQuantity - 1) {
            await this.bot.sendMessage(
              chatId,
              `📊 <b>Progress:</b> ${i + 1}/${totalQuantity}\n` +
                `✅ <b>Success:</b> ${successCount}\n` +
                `❌ <b>Failed:</b> ${failCount}`,
              { parse_mode: 'HTML' },
            );
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } catch (error) {
          failCount++;
          results.push(`❌ NFT ${i + 1} - Error: ${error.message}`);
        }
      }

      // Send final results
      let finalMessage = `🎨 <b>Minting Complete!</b>\n\n`;
      finalMessage += `📊 <b>Results:</b>\n`;
      finalMessage += `✅ <b>Successful:</b> ${successCount}\n`;
      finalMessage += `❌ <b>Failed:</b> ${failCount}\n`;
      finalMessage += `👛 <b>Wallet:</b> ${wallet.substring(0, 10)}...${wallet.substring(wallet.length - 10)}\n`;
      finalMessage += `🎨 <b>NFT:</b> ${randomNft.name} (${selectedType})\n\n`;

      if (results.length <= 20) {
        finalMessage += `📋 <b>Details:</b>\n`;
        results.forEach((result) => {
          finalMessage += `${result}\n`;
        });
      } else {
        finalMessage += `📋 <b>Details:</b> Too many results to display\n`;
      }

      await this.bot.sendMessage(chatId, finalMessage, { parse_mode: 'HTML' });
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        `❌ Error in minting: ${error.message}`,
      );
    }
  }

  async sendNotification(tx: any) {
    try {
      const logGroupId = this.configService.get<string>('TELEGRAM_LOG_GROUP_ID');
      if (!logGroupId) return;

      const user = tx.user as any;
      const username = user?.username || 'Unknown';
      const amount = Math.abs(tx.amount).toFixed(4);
      const type = tx.type === WalletTransactionType.DEPOSIT ? '📥 Deposit' : '📤 Withdraw';
      const status = tx.status === 'done' ? '✅' : '⏳';
      const hash = tx.hash ? `<code>${tx.hash}</code>` : 'N/A';

      const message = `🔔 <b>New Transaction Alert</b>\n\n` +
        `👤 <b>User:</b> ${username}\n` +
        `💰 <b>Amount:</b> ${amount} TON\n` +
        `📝 <b>Type:</b> ${type}\n` +
        `📊 <b>Status:</b> ${status} ${tx.status}\n` +
        `🔗 <b>Hash:</b>\n${hash}\n\n` +
        `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

      await this.bot.sendMessage(logGroupId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Error sending telegram notification:', error);
    }
  }
  async sendTestNotification() {
    try {
      const logGroupId = this.configService.get<string>('TELEGRAM_LOG_GROUP_ID');
      if (!logGroupId) {
        return { success: false, message: 'TELEGRAM_LOG_GROUP_ID not set' };
      }

      await this.bot.sendMessage(logGroupId, '👋 Hello from API Test! Bot is working correctly in this group.');
      return { success: true, message: 'Message sent' };
    } catch (error) {
      console.error('Error sending test notification:', error);
      return { success: false, message: error.message };
    }
  }
}
