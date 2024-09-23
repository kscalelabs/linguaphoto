"""it is entity for debugging"""
import uvicorn

from linguaphoto.main import app

uvicorn.run(app, port=8080, host="0.0.0.0")
