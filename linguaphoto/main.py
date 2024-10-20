"""Defines the main entrypoint for the FastAPI app."""

import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from linguaphoto.api.api import router
from linguaphoto.socket_manager import (
    sio,  # Import the `sio` and `notify_user` from socket.py
)

app = FastAPI()

# Adds CORS middleware.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="")

app.mount("/", socketio.ASGIApp(sio, other_asgi_app=app))
if __name__ == "__main__":
    print("Starting webserver...")
    uvicorn.run(app, port=8080, host="0.0.0.0")
