from sqlalchemy import Column, Integer, Float, String, Date
from src.database import Base, engine


class AQIHistory(Base):
    __tablename__ = "aqi_history"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String)
    date = Column(Date)
    aqi = Column(Float)
    predicted_aqi = Column(Float)


Base.metadata.create_all(bind=engine)
