"""Defines the main entrypoint for the FastAPI app."""

from fastapi import FastAPI, Request, status
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

# Adds CORS middleware.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": "The request was invalid.", "detail": str(exc)},
    )


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello, World!"}

if __name__ == "__main__":
    print("Starting webserver...")
    uvicorn.run(app, port=8080, host='0.0.0.0')
