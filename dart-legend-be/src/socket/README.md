# Socket Management API

Tài liệu này mô tả các API endpoints để quản lý socket connections.

## Endpoints

### 1. Lấy danh sách tất cả clients đang kết nối

```
GET /socket/clients
```

**Response:**

```json
{
  "clients": [
    {
      "id": "socket_id_123",
      "userId": "user_id_456",
      "rooms": ["room1", "room2"],
      "connectedAt": "2025-03-09T08:22:00.000Z"
    }
  ],
  "totalCount": 1
}
```

### 2. Lấy số lượng clients đang kết nối

```
GET /socket/clients/count
```

**Response:**

```json
{
  "count": 5
}
```

### 3. Lấy danh sách clients theo userId

```
GET /socket/clients/user/:userId
```

**Response:**

```json
[
  {
    "id": "socket_id_123",
    "userId": "user_id_456",
    "rooms": ["room1"],
    "connectedAt": "2025-03-09T08:22:00.000Z"
  }
]
```

### 4. Disconnect tất cả clients

```
DELETE /socket/clients/all
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully disconnected all clients",
  "disconnectedCount": 5
}
```

### 5. Disconnect client theo socket ID (Body)

```
DELETE /socket/clients/socket
Content-Type: application/json

{
  "socketId": "socket_id_123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully disconnected client with socket ID: socket_id_123",
  "disconnectedCount": 1
}
```

### 6. Disconnect clients theo user ID (Body)

```
DELETE /socket/clients/user
Content-Type: application/json

{
  "userId": "user_id_456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully disconnected 2 client(s) for user user_id_456",
  "disconnectedCount": 2
}
```

### 7. Disconnect client theo socket ID (Path Parameter)

```
DELETE /socket/clients/socket/:socketId
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully disconnected client with socket ID: socket_id_123",
  "disconnectedCount": 1
}
```

### 8. Disconnect clients theo user ID (Path Parameter)

```
DELETE /socket/clients/user/:userId
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully disconnected 2 client(s) for user user_id_456",
  "disconnectedCount": 2
}
```

## Cách sử dụng

### Với curl:

```bash
# Lấy danh sách clients
curl -X GET http://localhost:3000/socket/clients

# Lấy số lượng clients
curl -X GET http://localhost:3000/socket/clients/count

# Disconnect tất cả clients
curl -X DELETE http://localhost:3000/socket/clients/all

# Disconnect client theo socket ID
curl -X DELETE http://localhost:3000/socket/clients/socket \
  -H "Content-Type: application/json" \
  -d '{"socketId": "your_socket_id"}'

# Disconnect clients theo user ID
curl -X DELETE http://localhost:3000/socket/clients/user \
  -H "Content-Type: application/json" \
  -d '{"userId": "your_user_id"}'
```

### Với JavaScript/TypeScript:

```typescript
// Lấy danh sách clients
const clients = await fetch('/socket/clients').then((res) => res.json());

// Disconnect tất cả clients
const result = await fetch('/socket/clients/all', {
  method: 'DELETE',
}).then((res) => res.json());

// Disconnect client theo socket ID
const result = await fetch('/socket/clients/socket', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ socketId: 'your_socket_id' }),
}).then((res) => res.json());
```

## Lưu ý

- Tất cả các operations disconnect sẽ được log trong console
- Socket ID là unique identifier được tạo tự động bởi Socket.IO
- User ID cần được set trong `socket.data.userId` khi client connect
- Thời gian connect được lưu tự động trong `socket.data.connectedAt`
