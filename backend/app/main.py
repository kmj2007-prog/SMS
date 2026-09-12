from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.commute import router as commute_router
from app.routers.listings import router as listings_router
from app.routers.places import router as places_router
from app.routers.recommendations import router as recommendations_router


app = FastAPI(
    title="SMS API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(listings_router)
app.include_router(places_router)
app.include_router(commute_router)
app.include_router(recommendations_router)


@app.get("/")
def root():
    return {
        "message": "SMS backend is running"
    }