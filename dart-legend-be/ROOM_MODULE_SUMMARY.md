# Room Module - Tóm tắt

## Các file đã được tạo:

### 1. Models

- `src/database/models/room.model.ts` - Model cho Room và RoomInvitation

### 2. DTOs

- `src/room/dto/create-room.dto.ts` - DTO cho việc tạo room
- `src/room/dto/send-invitation.dto.ts` - DTO cho việc gửi lời mời
- `src/room/dto/respond-invitation.dto.ts` - DTO cho việc phản hồi lời mời
- `src/room/dto/continue-game.dto.ts` - DTO cho việc tiếp tục chơi
- `src/room/dto/index.ts` - File export tất cả DTOs

### 3. Service & Controller

- `src/room/room.service.ts` - Service chính cho room
- `src/room/room.controller.ts` - Controller với các API endpoints
- `src/room/room.module.ts` - Module configuration

### 4. Documentation & Tests

- `src/room/README.md` - Hướng dẫn sử dụng
- `src/room/room.service.spec.ts` - Unit tests

## Các file đã được cập nhật:

### 1. Socket Events

- `src/utils/socket.ts` - Thêm các event mới cho room

### 2. Database Module

- `src/database/database.module.ts` - Thêm RoomModel và RoomInvitationModel

### 3. App Module

- `src/app.module.ts` - Import RoomModule

### 4. Game Module & Service

- `src/game/game.module.ts` - Import RoomModule
- `src/game/game.service.ts` - Tích hợp với RoomService

## Tính năng chính:

1. **Tạo phòng**: User có thể tạo phòng chơi game
2. **Gửi lời mời**: Chủ phòng gửi lời mời đến user khác (có thời hạn 5 phút)
3. **Phản hồi lời mời**: User được mời có thể chấp nhận/từ chối
4. **Tự động tạo game**: Khi có đủ 2 người, game tự động bắt đầu
5. **Tiếp tục chơi**: Sau khi game kết thúc, có thể chơi tiếp hoặc đóng phòng
6. **Quản lý phòng**: Xem danh sách phòng, chi tiết phòng, rời phòng

## API Endpoints:

- `POST /room` - Tạo phòng
- `POST /room/:roomId/invite` - Gửi lời mời
- `POST /room/invitation/respond` - Phản hồi lời mời
- `POST /room/continue` - Tiếp tục chơi
- `GET /room/my-rooms` - Lấy danh sách phòng của tôi
- `GET /room/:roomId` - Lấy chi tiết phòng
- `GET /room/invitations/my` - Lấy danh sách lời mời
- `POST /room/:roomId/leave` - Rời phòng

## Socket Events:

- `room_created` - Phòng được tạo
- `room_invitation` - Có lời mời mới
- `invitation_accepted` - Lời mời được chấp nhận
- `invitation_rejected` - Lời mời bị từ chối
- `user_joined_room` - User tham gia phòng
- `user_left_room` - User rời phòng
- `room_game_started` - Game bắt đầu trong phòng
- `room_game_ended` - Game kết thúc trong phòng
- `room_closed` - Phòng bị đóng

## Luồng hoạt động:

1. User A tạo phòng
2. User A gửi lời mời cho User B
3. User B chấp nhận lời mời
4. Game tự động bắt đầu khi có đủ 2 người
5. Game kết thúc sau 1 phút
6. Cả 2 người chơi quyết định chơi tiếp hoặc đóng phòng

## Lưu ý:

- Lời mời có thời hạn 5 phút
- Chỉ chủ phòng mới có thể gửi lời mời
- Phòng sẽ tự động đóng khi không còn người chơi
- Game sẽ tự động bắt đầu khi có đủ 2 người chơi
- Tích hợp với hệ thống game hiện tại
- Sử dụng transaction để đảm bảo tính nhất quán dữ liệu


