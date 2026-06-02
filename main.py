from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import joblib
from src.build_features import ApiDataError, CityNotFoundError, build_features
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
FRONTEND_DIST = Path(__file__).resolve().parent / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"


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
    history = get_last_records(db, city, 14)
    values = [current_aqi] + [record.aqi for record in history if record.aqi is not None]

    if len(values) < 2:
        return [current_aqi] * 5, current_aqi, current_aqi

    lag_1 = values[0]
    lag_2 = values[1] if len(values) > 1 else values[0]
    lag_3 = values[2] if len(values) > 2 else values[-1]
    lag_7 = values[6] if len(values) > 6 else values[-1]
    lag_14 = values[13] if len(values) > 13 else values[-1]

    recent_for_rolls = values[:14]
    roll7_values = recent_for_rolls[:7] if len(recent_for_rolls) >= 7 else recent_for_rolls
    roll14_values = recent_for_rolls[:14]

    roll7 = sum(roll7_values) / len(roll7_values)
    roll14 = sum(roll14_values) / len(roll14_values)

    return [lag_1, lag_2, lag_3, lag_7, lag_14], roll7, roll14


@app.post("/predict")
def predict(data: UserInput, db: Session = Depends(get_db)):

    try:
        lags, roll7, roll14 = get_lags(db, data.city, data.current_aqi)
        features = build_features(data.city, lags, roll7, roll14)
    except CityNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ApiDataError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

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


if (FRONTEND_DIST / "assets").exists():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="frontend-assets",
    )


@app.get("/", include_in_schema=False)
def serve_frontend():
    if not FRONTEND_INDEX.exists():
        raise HTTPException(
            status_code=404,
            detail="Frontend build not found. Run `npm run build` in frontend/.",
        )
    return FileResponse(FRONTEND_INDEX)


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend_path(full_path: str):
    if not FRONTEND_INDEX.exists():
        raise HTTPException(
            status_code=404,
            detail="Frontend build not found. Run `npm run build` in frontend/.",
        )

    requested_path = (FRONTEND_DIST / full_path).resolve()
    if requested_path.is_file() and FRONTEND_DIST in requested_path.parents:
        return FileResponse(requested_path)

    return FileResponse(FRONTEND_INDEX)
