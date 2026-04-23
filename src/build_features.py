from datetime import datetime
import numpy as np


def build_features(city, current_aqi):
    today = datetime.now()

    month = today.month
    day = today.day
    dayofweek = today.weekday()
    year = today.year

    # season encoding
    if month in [12, 1, 2]:
        season = 0
    elif month in [3, 4, 5]:
        season = 1
    elif month in [6, 7, 8, 9]:
        season = 2
    else:
        season = 3

    # demo weather (replace later with weather API)
    weather = {
        "Temp_degree_C": 28,
        "RH": 65,
        "WS_m_s": 2.5,
        "WD_deg": 180,
        "SR_W_mt2": 220,
        "RF_mm": 0,
        "AT_degree_C": 29,
    }

    # simple lag simulation
    lag_1 = current_aqi
    lag_2 = current_aqi * 0.97
    lag_3 = current_aqi * 0.95
    lag_7 = current_aqi * 1.05
    lag_14 = current_aqi * 1.02

    roll7 = np.mean([lag_1, lag_2, lag_3, lag_7])
    roll14 = np.mean([lag_1, lag_2, lag_3, lag_7, lag_14])

    # placeholder pollutant averages
    pollutants = [120, 25, 40, 50, 20, 10, 0.8, 60, 5, 7, 1.5, 4]

    features = (
        pollutants
        + list(weather.values())
        + [
            year,
            month,
            day,
            dayofweek,
            season,
            lag_1,
            lag_2,
            lag_3,
            lag_7,
            lag_14,
            roll7,
            roll14,
        ]
    )

    return np.array(features).reshape(1, -1)
