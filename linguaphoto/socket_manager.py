"""Socket part."""

import socketio

from linguaphoto.settings import settings

# Create a new Socket.IO server with CORS enabled
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=["http://localhost:3000"]
)
# Dictionary to store connected users by their socket ID
connected_users: dict[str, str] = {}


# Handle client connection
@sio.event
async def connect(sid: str) -> None:
    print(f"User connected: {sid}")


# Handle client disconnection
@sio.event
async def disconnect(sid: str) -> None:
    if sid in connected_users:
        print(f"User {connected_users[sid]} disconnected")
        del connected_users[sid]


# Event for registering a specific user (e.g., after authentication)
@sio.event
async def register_user(sid: str, user_id: str) -> None:
    connected_users[user_id] = sid
    print(f"User {user_id} registered with session ID {sid}")


# Event to notify a specific user
async def notify_user(user_id: str, message: dict) -> None:
    sid = connected_users.get(user_id)
    if sid:
        await sio.emit("notification", message, room=sid)
    else:
        print(f"User {user_id} is not connected")


# Export the `sio` instance so it can be used in other files
