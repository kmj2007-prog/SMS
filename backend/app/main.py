from fastapi import FastAPI

from app.routers.listings import router as listings_router


app = FastAPI()


app.include_router(listings_router)


@app.get("/")
def root():
    return {"message": "SMS backend is running"}