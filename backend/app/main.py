from fastapi import FastAPI

from app.routers.listings import router as listings_router


app = FastAPI(
    title="SMS API",
    version="1.0.0",
)


app.include_router(listings_router)


@app.get("/")
def root():
    return {
        "message": "SMS backend is running"
    }