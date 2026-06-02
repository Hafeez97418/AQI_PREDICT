from sqlalchemy.orm import Session
from src.models import AQIHistory
from datetime import date


def save_record(db: Session, city, aqi, predicted):
    record = AQIHistory(city=city, date=date.today(), aqi=aqi, predicted_aqi=predicted)
    db.add(record)
    db.commit()


def get_last_records(db: Session, city, limit=14):
    return (
        db.query(AQIHistory)
        .filter(AQIHistory.city == city)
        .order_by(AQIHistory.id.desc())
        .limit(limit)
        .all()
    )


def get_paginated_predictions(db: Session, page: int, limit: int):
    offset = (page - 1) * limit

    # total rows count
    total_records = db.query(AQIHistory).count()

    # paginated query
    rows = (
        db.query(AQIHistory)
        .order_by(AQIHistory.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return total_records, rows
