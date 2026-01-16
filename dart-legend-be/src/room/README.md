# Room Module

Module này quản lý các phòng chơi game, cho phép người dùng tạo phòng, gửi lời mời và chơi game với nhau.

## Tính năng chính

1. **Tạo phòng**: Người dùng có thể tạo phòng chơi game
2. **Gửi lời mời**: Chủ phòng có thể gửi lời mời đến người dùng khác
3. **Phản hồi lời mời**: Người được mời có thể chấp nhận hoặc từ chối
4. **Chơi game**: Khi có đủ 2 người, game sẽ tự động bắt đầu
5. **Tiếp tục chơi**: Sau khi game kết thúc, có thể chơi tiếp hoặc đóng phòng

## API Endpoints

### Tạo phòng

```
POST /room
Body: {
  "isPrivate": boolean (optional),
  "maxPlayers": number (optional, default: 2)
}
```

### Gửi lời mời

```
POST /room/:roomId/invite
Body: {
  "toUserId": string
}
```

### Phản hồi lời mời

```
POST /room/invitation/respond
Body: {
  "invitationId": string,
  "action": "ACCEPT" | "REJECT"
}
```

### Tiếp tục chơi

```
POST /room/continue
Body: {
  "roomId": string,
  "action": "CONTINUE" | "CANCEL"
}
```

### Lấy danh sách phòng của tôi

```
GET /room/my-rooms
```

### Lấy chi tiết phòng

```
GET /room/:roomId
```

### Lấy danh sách game trong phòng

```
GET /room/:roomId/games
```

### Lấy danh sách lời mời

```
GET /room/invitations/my
```

### Rời phòng

```
POST /room/:roomId/leave
```

## Socket Events

### Room Events

- `room_created`: Khi phòng được tạo
- `room_invitation`: Khi có lời mời mới
- `invitation_accepted`: Khi lời mời được chấp nhận
- `invitation_rejected`: Khi lời mời bị từ chối
- `user_joined_room`: Khi người dùng tham gia phòng
- `user_left_room`: Khi người dùng rời phòng
- `room_game_started`: Khi game bắt đầu trong phòng
- `room_game_ended`: Khi game kết thúc trong phòng
- `room_closed`: Khi phòng bị đóng

## Luồng hoạt động

1. **Tạo phòng**: User A tạo phòng
2. **Gửi lời mời**: User A gửi lời mời cho User B
3. **Chấp nhận lời mời**: User B chấp nhận lời mời
4. **Bắt đầu game**: Game tự động bắt đầu khi có đủ 2 người (game được liên kết với room)
5. **Kết thúc game**: Game kết thúc sau 1 phút
6. **Quyết định tiếp tục**: Cả 2 người chơi quyết định chơi tiếp hoặc đóng phòng

## Cấu trúc dữ liệu

- **Room**: Chứa thông tin phòng, danh sách người chơi, trạng thái
- **Game**: Chứa thông tin game, liên kết với room thông qua trường `room`
- **RoomInvitation**: Quản lý lời mời tham gia phòng

## Lưu ý

- Lời mời có thời hạn 5 phút
- Chỉ chủ phòng mới có thể gửi lời mời
- Phòng sẽ tự động đóng khi không còn người chơi
- Game sẽ tự động bắt đầu khi có đủ 2 người chơi
- Game được liên kết với room thông qua trường `room` trong Game model
- Không lưu danh sách games trong Room để tránh duplicate data
