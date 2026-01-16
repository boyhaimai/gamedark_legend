# Dart Legend Backend

Backend cho game Dart Legend - Game ném phi tiêu trên Telegram Mini App với tích hợp TON Blockchain và NFT.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Luồng hoạt động](#luồng-hoạt-động)
- [Các Module](#các-module)
- [Environment Variables](#environment-variables)
- [Database Models](#database-models)
- [Socket Events](#socket-events)
- [Cài đặt](#cài-đặt)
- [Scripts](#scripts)
- [API Documentation](#api-documentation)

## 🎯 Tổng quan

Dart Legend Backend là một ứng dụng NestJS cung cấp API và WebSocket server cho game ném phi tiêu. Hệ thống tích hợp với Telegram Bot, TON Blockchain, và hỗ trợ NFT marketplace.

**Công nghệ chính:**

- NestJS Framework
- MongoDB (Mongoose)
- Redis & Bull Queue
- Socket.IO (WebSocket)
- TON Blockchain Integration
- Telegram Bot API
- JWT Authentication

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Mini App                         │
│                    (Frontend Client)                         │
└────────────┬────────────────────────────┬────────────────────┘
             │                            │
             │ HTTP/REST API              │ WebSocket
             │                            │
┌────────────▼────────────────────────────▼────────────────────┐
│                     NestJS Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Layer (Controllers)                             │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Business Logic (Services)                           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  WebSocket Gateway (Socket.IO)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└────┬─────────┬─────────┬─────────┬──────────┬──────────┬────┘
     │         │         │         │          │
     │         │         │         │          │
┌────▼────┐ ┌──▼────┐ ┌──▼─────┐ ┌▼─────┐ ┌──▼────┐
│ MongoDB │ │ Redis │ │ Bull   │ │ TON  │ │Telegram│
│         │ │       │ │ Queue  │ │      │ │  Bot   │
└─────────┘ └───────┘ └────────┘ └──────┘ └────────┘
```

## 🔄 Luồng hoạt động

### 1. Authentication Flow (Luồng xác thực)

```
User mở Telegram Mini App
    ↓
Frontend gửi initData từ Telegram
    ↓
AuthController nhận request
    ↓
AuthService validate initData với Telegram Bot Token
    ↓
Tìm hoặc tạo User trong Database
    ↓
Tạo JWT Token
    ↓
Trả về access_token cho Frontend
    ↓
Frontend lưu token và sử dụng cho các request tiếp theo
```

### 2. Game Flow (Luồng chơi game)

```
User tạo/tham gia game
    ↓
GameService kiểm tra điều kiện (balance, user status)
    ↓
Tạo Game document trong MongoDB
    ↓
Lưu game state vào Redis (TTL 10 phút)
    ↓
User kết nối WebSocket và join room
    ↓
Users chơi game (bắn phi tiêu)
    ↓
Mỗi turn gửi qua Socket.IO (event: ATTACK)
    ↓
Server cập nhật điểm số trong Redis
    ↓
Broadcast state mới cho tất cả players trong room
    ↓
Khi đủ số turn → tự động kết thúc game
    ↓
Tính toán winner và phần thưởng
    ↓
Thêm job vào Bull Queue để xử lý reward
    ↓
CronjobProcessor xử lý reward (cập nhật balance, transaction)
    ↓
Lưu kết quả game vào MongoDB
    ↓
NFT reward được xử lý qua NftRewardProcessor
```

### 3. Room/Multiplayer Flow (Luồng phòng chơi)

```
User tạo Private Room
    ↓
RoomService tạo Room với unique code
    ↓
Tạo RoomInvitation documents
    ↓
Gửi invitation link cho friends
    ↓
Friends click link và join room
    ↓
Khi đủ players → Start game
    ↓
Chuyển sang Game Flow
```

### 4. TON Wallet Flow (Luồng ví TON)

```
User deposit TON
    ↓
Frontend gửi transaction trên TON blockchain
    ↓
CronTransactionWallet chạy mỗi phút (cron job)
    ↓
Lấy transactions từ TON RPC
    ↓
Kiểm tra transactions mới của Master Wallet
    ↓
Match transaction với user (qua memo/comment)
    ↓
Cập nhật balance trong User document
    ↓
Tạo WalletTransaction record
    ↓
Gửi notification cho user

User withdraw TON
    ↓
WithdrawController nhận request
    ↓
Kiểm tra balance và điều kiện withdraw
    ↓
Tạo pending WalletTransaction
    ↓
TonService thực hiện transaction trên blockchain
    ↓
Cập nhật transaction status
    ↓
Trừ balance của user
```

### 5. NFT Flow (Luồng NFT)

```
Admin mint NFT (qua Telegram Bot)
    ↓
MintNftService deploy NFT collection
    ↓
Mint NFT items lên TON blockchain
    ↓
Transfer NFT tới user wallet
    ↓
Lưu NFT info vào MongoDB

User buy NFT từ marketplace
    ↓
NftController nhận request
    ↓
Kiểm tra balance và NFT availability
    ↓
Tạo Order document
    ↓
Trừ balance user
    ↓
Tạo UserNFT record
    ↓
Transfer NFT (nếu cần)
```

### 6. Social/Referral Flow (Luồng giới thiệu)

```
User share referral link
    ↓
New user mở app với start_param=referrerCode
    ↓
AuthService parse referrerCode từ initData
    ↓
UserService tạo new user và Referral record
    ↓
Tính điểm thưởng cho referrer
    ↓
Cập nhật balance referrer
    ↓
Tạo Transaction record
```

### 7. Checkin/Daily Attendance Flow

```
User checkin hàng ngày
    ↓
CheckinService kiểm tra last checkin
    ↓
Tạo DailyAttendance record
    ↓
Tính reward dựa trên streak
    ↓
Cập nhật user balance
    ↓
Tạo Transaction record
```

### 8. Telegram Bot Admin Flow

```
Admin gửi /admin command
    ↓
BotTeleService hiển thị admin panel
    ↓
Admin chọn action (users list, transactions, set bot, mint NFT, v.v.)
    ↓
Bot xử lý command và tương tác với database
    ↓
Hiển thị kết quả cho admin
```

## 📦 Các Module

### 1. **App Module** (Root Module)

- **File:** `src/app.module.ts`
- **Chức năng:** Module gốc của ứng dụng, import tất cả modules con
- **Dependencies:**
  - ConfigModule (global)
  - RedisModule
  - BullModule (Queue system)
  - ScheduleModule (Cron jobs)

### 2. **Auth Module**

- **Path:** `src/auth/`
- **Chức năng:** Xác thực người dùng qua Telegram initData
- **Components:**
  - `AuthController`: API endpoints cho login
  - `AuthService`: Logic xác thực và tạo JWT token
  - `JwtStrategy`: Passport JWT strategy
  - `AuthGuard`: Global guard bảo vệ routes
- **Flow:** Validate initData → Verify với Telegram → Tạo/Update User → Generate JWT

### 3. **User Module**

- **Path:** `src/user/`
- **Chức năng:** Quản lý thông tin user, leaderboard, referral system
- **Components:**
  - `UserController`: CRUD operations cho user
  - `LeaderboardController`: Rankings và leaderboards
  - `UserService`: Business logic cho user
  - `TreeSystemService`: Referral tree system
- **Features:**
  - User profile management
  - Balance tracking
  - Referral system
  - Leaderboards (total points, daily, weekly)

### 4. **Game Module**

- **Path:** `src/game/`
- **Chức năng:** Logic chính của game ném phi tiêu
- **Components:**
  - `GameController`: API endpoints cho game
  - `GameService`: Game logic, matchmaking, scoring
- **Features:**
  - Random matchmaking
  - Game state management (Redis)
  - Turn-based gameplay
  - Winner calculation
  - Reward distribution
- **Integration:** Socket.IO, Bull Queue

### 5. **Socket Module**

- **Path:** `src/socket/`
- **Chức năng:** Real-time communication qua WebSocket
- **Components:**
  - `SocketGateway`: WebSocket gateway với Socket.IO
  - `SocketService`: Helper service
  - `WsJwtGuard`: WebSocket authentication guard
- **Events:**
  - `JOIN_GAME`: Join game room
  - `ATTACK`: Send game move
  - `GET_GAME`: Get current game state
  - `END_GAME`: Game finished
  - `START_GAME`: Game started
  - `JOIN_ROOM_PRIVATE`: Join private room

### 6. **Room Module**

- **Path:** `src/room/`
- **Chức năng:** Quản lý private rooms cho multiplayer
- **Components:**
  - `RoomController`: Room CRUD APIs
  - `RoomService`: Room logic, invitations
- **Features:**
  - Create private rooms
  - Generate unique room codes
  - Room invitations
  - Room chat/messages
  - Start games in rooms

### 7. **TON Wallet Module**

- **Path:** `src/ton-wallet/`
- **Chức năng:** Tích hợp TON blockchain và quản lý ví
- **Components:**
  - `TonWalletController`: Deposit/Withdraw APIs
  - `TonWalletService`: Wallet operations
  - `TonService`: TON blockchain interactions
  - `TonTransactionService`: Transaction processing
  - `TonPriceService`: TON price tracking
  - `JettonService`: Jetton token operations
  - `CronTransactionWallet`: Cron job check transactions
- **Features:**
  - Generate deposit addresses
  - Track deposits (cron every minute)
  - Process withdrawals
  - TON/USD price tracking
  - Jetton transfers

### 8. **NFT Module**

- **Path:** `src/nft/`
- **Chức năng:** NFT marketplace và minting
- **Components:**
  - `NftController`: NFT APIs
  - `NftService`: NFT CRUD operations
  - `MintNftService`: Deploy và mint NFTs lên TON
- **Features:**
  - NFT collection management
  - Mint NFTs
  - Transfer NFTs
  - NFT marketplace
  - User NFT inventory
  - NFT types: Common, Rare, Legendary

### 9. **Bot Tele Module**

- **Path:** `src/bot-tele/`
- **Chức năng:** Telegram bot cho admin và user interactions
- **Components:**
  - `BotTeleService`: Bot logic với Grammy framework
- **Features:**
  - `/start` command - Open mini app
  - `/admin` command - Admin panel
  - Admin features:
    - View users list
    - Check master wallet balance
    - View transactions
    - Set/unset bot users
    - Configure sale times & discounts
    - Mint NFTs to wallets
  - Deep linking với referral codes
  - Inline keyboards
  - Web App button

### 10. **Queue Module**

- **Path:** `src/queue/`
- **Chức năng:** Background job processing với Bull
- **Components:**
  - `QueueService`: Queue management
  - `CronjobProcessor`: Process cronjob tasks
  - `NftRewardProcessor`: Process NFT rewards
- **Queues:**
  - `cronjob-queue`: General cronjobs
  - `nft_reward`: NFT reward distribution
- **Jobs:**
  - `REWARD_ENDGAME`: Distribute rewards sau khi game kết thúc
  - NFT reward processing

### 11. **Database Module**

- **Path:** `src/database/`
- **Chức năng:** MongoDB connection và model definitions
- **Models:** (xem chi tiết ở [Database Models](#database-models))

### 12. **Checkin Module**

- **Path:** `src/checkin/`
- **Chức năng:** Daily check-in rewards
- **Features:**
  - Daily attendance tracking
  - Streak counting
  - Progressive rewards
  - Bonus for consecutive days

### 13. **Social Module**

- **Path:** `src/social/`
- **Chức năng:** Social tasks và missions
- **Features:**
  - Social media tasks (Follow, Like, Share)
  - Task verification
  - Task rewards
  - Mission completion tracking

### 14. **AWS Module**

- **Path:** `src/aws/`
- **Chức năng:** AWS S3 file upload
- **Features:**
  - Upload images
  - Store NFT metadata
  - File management

### 15. **Common Module**

- **Path:** `src/common/`
- **Chức năng:** Shared utilities, decorators, filters, interceptors
- **Components:**
  - `HttpExceptionFilter`: Global exception handler
  - `TransformInterceptor`: Response transformation
  - Custom decorators
  - DTOs

## 🔐 Environment Variables

Tạo file `.env` trong root directory với các biến sau:

### Core Application

```bash
# Application
NODE_ENV=development                    # Environment: development, production
PORT=3579                              # API port
WEBSOCKET_PORT=8080                    # WebSocket port
LOCAL=LOCAL                            # Set to 'LOCAL' để disable Telegram bot khi dev local

# Client
CLIENT_URL=https://your-frontend-url   # Frontend URL (Telegram Mini App URL)
```

### Database & Caching

```bash
# MongoDB
MONGO_URL=mongodb://localhost:27017/dart-legend    # MongoDB connection string

# Redis & Queue
QUEUE_HOST=localhost                   # Redis host
QUEUE_PORT=6379                        # Redis port
QUEUE_USERNAME=                        # Redis username (nếu có)
QUEUE_PASSWORD=                        # Redis password (nếu có)
```

### Authentication

```bash
# JWT
JWT_SECRET_KEY=AAF3ewpE7z99nSNY5OSnXjh1InXwAH02m9s    # JWT secret key (đổi trong production)
```

### Telegram

```bash
# Telegram Bot
TELEGRAM_BOT_API_KEY=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11    # Bot token từ @BotFather
TELEGRAM_GROUP_URL=https://t.me/your_group                        # Community group URL

# Swagger Basic Auth (cho production)
SWAGGER_USER=dart-legend-game-hola     # Swagger UI username
SWAGGER_PASSWORD=123123123             # Swagger UI password
```

### TON Blockchain

```bash
# TON Wallet
TON_MASTER_WALLET_ADDRESS=UQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # Master wallet address
TON_MASTER_WALLET_MNEMONIC=word1 word2 word3 ... word24               # 24 từ seed phrase
TON_BOT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx                             # TON Center API key
JETTON_MASTER_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx       # Jetton contract address (nếu dùng custom token)
```

### Example `.env` file

````bash
# Core
NODE_ENV=development
PORT=3579
WEBSOCKET_PORT=8080
CLIENT_URL=https://t.me/your_bot/app

# Database
MONGO_URL=mongodb://localhost:27017/dart-legend

# Redis
QUEUE_HOST=localhost
QUEUE_PORT=6379
QUEUE_USERNAME=
QUEUE_PASSWORD=

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Telegram
TELEGRAM_BOT_API_KEY=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_GROUP_URL=https://t.me/dartlegend

# Swagger
SWAGGER_USER=admin
SWAGGER_PASSWORD=secure-password

# TON
TON_MASTER_WALLET_ADDRESS=UQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TON_MASTER_WALLET_MNEMONIC=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24
TON_BOT_API_KEY=your-toncenter-api-key
JETTON_MASTER_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


## 💾 Database Models

### User Model

```typescript
{
  userId: number; // Telegram user ID
  username: string; // Username
  first_name: string; // First name
  last_name: string; // Last name
  avatar: string; // Profile photo URL
  code: string; // Unique referral code
  balance: number; // Game balance
  totalPoint: number; // Total points earned
  referrerCode: string; // Referrer's code
  is_bot: boolean; // Is bot user?
  is_premium: boolean; // Telegram premium?
  role: 'user' | 'admin'; // User role
  nonce: number; // Transaction nonce
}
````

### Game Model

```typescript
{
  user_1: ObjectId                 // Player 1 reference
  user_2: ObjectId                 // Player 2 reference
  total_point_user_1: number       // Total score player 1
  total_point_user_2: number       // Total score player 2
  count_turn_user_1: number        // Turn count player 1
  count_turn_user_2: number        // Turn count player 2
  winner: User                     // Winner info
  win: ObjectId                    // Winner user ID
  status: GameStatus               // FIND_GAME, START_GAME, ENDED, CANCEL
  detail: {                        // Detailed turn data
    user_1: { turn_1, turn_2, ... }
    user_2: { turn_1, turn_2, ... }
  }
  type: 'single' | 'room'         // Game type
  roomId: ObjectId                 // Room reference (nếu có)
}
```

### Transaction Model

```typescript
{
  user: ObjectId; // User reference
  balance: number; // Transaction amount
  type: TransactionType; // REWARD, DEDUCT, REFERRAL, etc.
  status: TransactionStatus; // PENDING, SUCCESS, FAILED
  description: string; // Transaction description
}
```

### WalletTransaction Model

```typescript
{
  user: ObjectId; // User reference
  type: 'deposit' | 'withdraw'; // Transaction type
  amount: number; // Amount in TON
  hash: string; // Blockchain transaction hash
  status: 'pending' | 'done' | 'failed';
  wallet_address: string; // User's wallet address
}
```

### NFT Model

```typescript
{
  name: string; // NFT name
  image: string; // NFT image URL
  description: string; // Description
  type: 'common' | 'rare' | 'legendary';
  price: number; // Price in game currency
  power: number; // NFT power/stats
  accuracy: number; // Accuracy bonus
}
```

### UserNFT Model

```typescript
{
  user: ObjectId; // User reference
  nft: ObjectId; // NFT reference
  itemIndex: number; // NFT item index trên blockchain
  txHash: string; // Mint transaction hash
  isActive: boolean; // Is equipped?
}
```

### Room Model

```typescript
{
  name: string                     // Room name
  code: string                     // Unique room code
  creator: ObjectId                // Creator user ID
  players: ObjectId[]              // Player IDs
  maxPlayers: number               // Max player count
  status: 'waiting' | 'playing' | 'finished'
  isPrivate: boolean               // Private room?
  gameId: ObjectId                 // Current game ID
}
```

### RoomInvitation Model

```typescript
{
  room: ObjectId; // Room reference
  inviter: ObjectId; // Inviter user ID
  invitee: ObjectId; // Invitee user ID
  status: 'pending' | 'accepted' | 'rejected';
}
```

### DailyAttendance Model

```typescript
{
  user: ObjectId; // User reference
  date: Date; // Check-in date
  streak: number; // Consecutive days
  reward: number; // Reward amount
}
```

### Order Model

```typescript
{
  user: ObjectId; // User reference
  nft: ObjectId; // NFT reference
  price: number; // Purchase price
  status: 'pending' | 'completed' | 'failed';
}
```

### Mission/Task Models

```typescript
// Mission
{
  title: string;
  description: string;
  reward: number;
  type: 'social' | 'game' | 'referral';
  isActive: boolean;
}

// VerifyModel (User's mission progress)
{
  user: ObjectId;
  mission: ObjectId;
  isCompleted: boolean;
  completedAt: Date;
}
```

### Config Model

```typescript
{
  key: string; // Config key
  value: any; // Config value
  description: string; // Description
}
```

### SaleConfig Model

```typescript
{
  saleStartAt: Date; // Sale start time
  saleEndAt: Date; // Sale end time
  discountPercent: number; // Discount percentage
}
```

## 🔌 Socket Events

### Client → Server Events

#### `JOIN_GAME`

```typescript
// Join một game room
data: string(gameId);
```

#### `JOIN_ROOM_PRIVATE`

```typescript
// Join private room
data: string(roomId);
```

#### `ATTACK`

```typescript
// Gửi turn chơi game
data: {
  game_id: string;
  user_id: string;
  point: number; // Điểm số của turn
}
```

#### `GET_GAME`

```typescript
// Lấy game state hiện tại
data: string(gameId);
```

### Server → Client Events

#### `START_GAME`

```typescript
// Game bắt đầu
data: Game;
```

#### `ATTACK`

```typescript
// Broadcast turn mới
data: Game (updated state)
```

#### `END_GAME`

```typescript
// Game kết thúc
data: Game (with winner)
```

#### `SEND_DATA_GAME`

```typescript
// Response cho GET_GAME
data: Game;
```

#### `joinedRoom`

```typescript
// Confirmation join room thành công
data: string(roomId);
```

## 🚀 Cài đặt

### Prerequisites

- Node.js >= 18
- MongoDB >= 5.0
- Redis >= 6.0
- Yarn
- TON Wallet với testnet/mainnet tokens

### Installation Steps

1. **Clone repository**

```bash
git clone <repository-url>
cd dart-legend-be
```

2. **Install dependencies**

```bash
yarn install
```

3. **Setup environment variables**

```bash
# Tạo .env file
cp .env.example .env

# Edit .env và điền các thông tin cần thiết
nano .env
```

4. **Start MongoDB & Redis**

```bash
# MongoDB
mongod --dbpath /path/to/data

# Redis
redis-server
```

5. **Run application**

```bash
# Development mode với hot reload
yarn dev

# Production build
yarn build
yarn start:prod
```

6. **Verify installation**

- API Docs: http://localhost:3579/docs
- WebSocket: ws://localhost:8080

## 📜 Scripts

```bash
# Development
yarn dev                # Start với watch mode
yarn start              # Start bình thường
yarn start:debug        # Start với debug mode

# Build
yarn build              # Build production

# Production
yarn start:prod         # Run production build

# Code Quality
yarn lint               # Run ESLint
yarn format             # Format code với Prettier

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests với watch mode
yarn test:cov           # Run tests với coverage
yarn test:e2e           # Run E2E tests
```

## 📚 API Documentation

Sau khi start server, truy cập Swagger UI tại:

**Development:**

- http://localhost:3579/docs

**Production:**

- https://your-domain.com/docs
- Username: (xem `SWAGGER_USER` trong .env)
- Password: (xem `SWAGGER_PASSWORD` trong .env)

### API Endpoints Overview

#### Auth

- `POST /api/auth/login` - Login với Telegram initData
- `POST /api/auth/login-dev` - Dev login (development only)

#### User

- `GET /api/user/profile` - Get user profile
- `GET /api/user/referrals` - Get referral list
- `GET /api/leaderboard/total` - Total points leaderboard
- `GET /api/leaderboard/daily` - Daily leaderboard
- `GET /api/leaderboard/weekly` - Weekly leaderboard

#### Game

- `POST /api/game/create` - Tạo/Join game
- `GET /api/game/:id` - Get game details
- `GET /api/game/history` - Game history

#### Room

- `POST /api/room/create` - Create private room
- `GET /api/room/:code` - Get room by code
- `POST /api/room/:id/join` - Join room
- `POST /api/room/:id/start` - Start game in room
- `GET /api/room/:id/messages` - Get room messages

#### TON Wallet

- `GET /api/ton-wallet/balance` - Get wallet balance
- `POST /api/ton-wallet/deposit` - Generate deposit address
- `POST /api/ton-wallet/withdraw` - Request withdrawal
- `GET /api/ton-wallet/transactions` - Get transaction history
- `GET /api/ton-wallet/price` - Get TON price

#### NFT

- `GET /api/nft` - List all NFTs
- `POST /api/nft` - Create NFT (admin)
- `GET /api/nft/user` - Get user's NFTs
- `GET /api/nft/reward-history` - Get NFT reward history (TON + SGC)
- `POST /api/nft/buy/:id` - Buy NFT
- `POST /api/nft/equip/:id` - Equip NFT

#### Social

- `GET /api/social/tasks` - Get available tasks
- `POST /api/social/verify/:id` - Verify task completion

#### Checkin

- `POST /api/checkin` - Daily check-in
- `GET /api/checkin/status` - Get check-in status

#### Socket Management (Admin)

- `GET /api/socket/clients` - List connected clients
- `GET /api/socket/stats` - Socket statistics
- `DELETE /api/socket/disconnect/:socketId` - Disconnect client

## 🔧 Configuration Files

### nest-cli.json

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}
```

### tsconfig.json

- Compiler options cho TypeScript
- Path aliases
- Build configurations

### ecosystem.config.js

- PM2 configuration cho production deployment
- Process management
- Cluster mode settings

### docker-compose.yml

- MongoDB service
- Redis service
- Application container
- Network configuration

## 🔒 Security Notes

1. **JWT Secret**: Đổi `JWT_SECRET_KEY` trong production, dùng string mạnh (32+ characters)
2. **Telegram Bot Token**: Giữ bí mật `TELEGRAM_BOT_API_KEY`
3. **TON Mnemonic**: **TUYỆT ĐỐI** không commit file .env, backup mnemonic an toàn
4. **AWS Credentials**: Rotate keys định kỳ, dùng IAM roles nếu có thể
5. **MongoDB**: Enable authentication trong production
6. **Redis**: Set password cho Redis instance
7. **Swagger**: Enable basic auth trong production (đã config)

## 📝 Development Notes

### Adding New Module

```bash
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

### Database Migrations

- Project sử dụng Mongoose (schemaless)
- Không cần migrations formalized
- Schema changes tự động apply qua model definitions

### Queue Jobs

Thêm job mới:

1. Define task name trong `src/queue/type.ts`
2. Add processor logic trong `src/queue/*.processor.ts`
3. Queue job: `queueService.add(TaskName.YOUR_TASK, data)`

### Socket Events

Thêm event mới:

1. Define event trong `src/utils/socket.ts`
2. Add handler trong `socket.gateway.ts`
3. Update client để emit/listen event

### Cron Jobs

```typescript
@Cron('0 * * * *')  // Every hour
async handleCron() {
  // Your logic
}
```

## 🐛 Common Issues & Solutions

### Issue: MongoDB connection failed

```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Issue: Redis connection refused

```bash
# Check Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Issue: WebSocket connection failed

- Check `WEBSOCKET_PORT` không bị block bởi firewall
- Verify CORS settings trong `socket.gateway.ts`

### Issue: Telegram Bot không response

- Kiểm tra `TELEGRAM_BOT_API_KEY` đúng
- Verify bot đã enable inline mode
- Check `CLIENT_URL` trỏ đúng frontend URL

### Issue: TON transactions không được detect

- Verify `TON_MASTER_WALLET_ADDRESS` đúng
- Check `TON_BOT_API_KEY` valid (toncenter.com)
- Cron job `CronTransactionWallet` có đang chạy không

## 📞 Support

- **Telegram Group:** [Your Community Group]
- **Developer:** [Your Name]
- **Issues:** [GitHub Issues Link]

## 📄 License

[Your License]

---

**Built with ❤️ by Dart Legend Team**
