export enum SocketEvent {
  FIND_GAME = 'find_game',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  END_GAME = 'end_game',
  JOIN_GAME = 'join_game',
  GET_GAME = 'get_game',
  SEND_DATA_GAME = 'send_data_game',

  // Room events
  ROOM_CREATED = 'room_created',
  ROOM_INVITATION = 'room_invitation',
  INVITATION_ACCEPTED = 'invitation_accepted',
  INVITATION_REJECTED = 'invitation_rejected',
  USER_JOINED_ROOM = 'user_joined_room',
  USER_LEFT_ROOM = 'user_left_room',
  ROOM_GAME_STARTED = 'room_game_started',
  ROOM_GAME_ENDED = 'room_game_ended',
  ROOM_CLOSED = 'room_closed',
  JOIN_ROOM_PRIVATE = 'join_room_private',
  // Room chat
  ROOM_CHAT_NEW_MESSAGE = 'room_chat_new_message',
}
