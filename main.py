from fastapi import FastAPI, Depends, Query
from pydantic import BaseModel
import joblib
from src.build_features import build_features
from src.database import SessionLocal
from src.history import save_record, get_paginated_predictions, get_last_records
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI()
model = joblib.load("aqi_model.pkl")


# Allow all origins (development mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all domains
    allow_credentials=True,
    allow_methods=["*"],  # allow all HTTP methods
    allow_headers=["*"],  # allow all headers
)


class UserInput(BaseModel):
    city: str
    current_aqi: float


def get_lags(db, city, current_aqi):
    history = get_last_records(db, city)

    if len(history) < 7:
        # fallback if new city
        return [current_aqi] * 5, current_aqi, current_aqi

    values = [r.aqi for r in history]

    lag_1 = values[0]
    lag_2 = values[1]
    lag_3 = values[2]
    lag_7 = values[6]
    lag_14 = values[-1] if len(values) >= 14 else values[-1]

    roll7 = sum(values[:7]) / 7
    roll14 = sum(values[:14]) / len(values)

    return [lag_1, lag_2, lag_3, lag_7, lag_14], roll7, roll14


@app.post("/predict")
def predict(data: UserInput, db: Session = Depends(get_db)):

    features = build_features(data.city, data.current_aqi)
    prediction = model.predict(features)[0]

    save_record(db, data.city, data.current_aqi, prediction)

    return {"Tomorrow_AQI": float(prediction)}


@app.get("/history/{city}")
def history(city: str, db: Session = Depends(get_db)):
    records = get_last_records(db, city, 30)
    return records


@app.get("/history")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total, records = get_paginated_predictions(db, page, limit)

    total_pages = (total + limit - 1) // limit

    return {
        "page": page,
        "limit": limit,
        "total_records": total,
        "total_pages": total_pages,
        "history": records,
    }
