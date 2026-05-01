from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import tasks, sync, config

app = FastAPI(title="QA Timeline Dashboard", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(sync.router)
app.include_router(config.router)


@app.get("/health")
def health():
    return {"status": "ok"}
