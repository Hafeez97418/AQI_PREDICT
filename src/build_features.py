from datetime import datetime
import numpy as np
import requests


class CityNotFoundError(ValueError):
    pass


class ApiDataError(RuntimeError):
    pass


GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
TIMEOUT_SECONDS = 10


def _get_json(url, params):
    try:
        response = requests.get(url, params=params, timeout=TIMEOUT_SECONDS)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        raise ApiDataError(f"Could not fetch data from {url}") from exc


def _first_number(data, key, default=0.0):
    value = data.get(key, default)
    if isinstance(value, list):
        value = next((item for item in value if item is not None), default)
    if value is None:
        return default
    return float(value)


def _geocode_city(city):
    data = _get_json(
        GEOCODING_URL,
        {
            "name": city,
            "count": 1,
            "language": "en",
            "format": "json",
        },
    )
    results = data.get("results") or []
    if not results:
        raise CityNotFoundError(
            f"Warning: the location APIs did not recognise '{city}'. "
            "Please check the city name and try again."
        )

    match = results[0]
    return float(match["latitude"]), float(match["longitude"])


def _fetch_weather(latitude, longitude):
    data = _get_json(
        WEATHER_URL,
        {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,relative_humidity_2m,wind_speed_10m,"
                "wind_direction_10m,shortwave_radiation,precipitation,"
                "apparent_temperature"
            ),
            "timezone": "auto",
        },
    )
    current = data.get("current")
    if not current:
        raise ApiDataError("Weather API did not return current weather data.")

    return {
        "Temp_degree_C": _first_number(current, "temperature_2m"),
        "RH_": _first_number(current, "relative_humidity_2m"),
        "WS_m_s": _first_number(current, "wind_speed_10m"),
        "WD_deg": _first_number(current, "wind_direction_10m"),
        "SR_W_mt2": _first_number(current, "shortwave_radiation"),
        "VWS_m_s": 0.0,
        "RF_mm": _first_number(current, "precipitation"),
        "AT_degree_C": _first_number(current, "apparent_temperature"),
    }


def _fetch_air_quality(latitude, longitude):
    data = _get_json(
        AIR_QUALITY_URL,
        {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,"
                "ozone,ammonia"
            ),
            "timezone": "auto",
        },
    )
    current = data.get("current")
    if not current:
        raise ApiDataError("Air-quality API did not return current pollutant data.")

    return {
        "PM10_ug_m3": _first_number(current, "pm10"),
        "NO_ug_m3": 0.0,
        "NO2_ug_m3": _first_number(current, "nitrogen_dioxide"),
        "NOx_ppb": 0.0,
        "NH3_ug_m3": _first_number(current, "ammonia"),
        "SO2_ug_m3": _first_number(current, "sulphur_dioxide"),
        "CO_mg_m3": _first_number(current, "carbon_monoxide") / 1000,
        "Ozone_ug_m3": _first_number(current, "ozone"),
        "Benzene_ug_m3": 0.0,
        "Toluene_ug_m3": 0.0,
        "Xylene_ug_m3": 0.0,
    }


def _season_for_month(month):
    if month in [12, 1, 2]:
        return 0
    if month in [3, 4, 5]:
        return 1
    if month in [6, 7, 8, 9]:
        return 2
    return 3


def build_features(city, lags, roll7, roll14):
    today = datetime.now()

    month = today.month
    day = today.day
    dayofweek = today.weekday()
    year = today.year

    season = _season_for_month(month)

    latitude, longitude = _geocode_city(city)
    weather = _fetch_weather(latitude, longitude)
    pollutants = _fetch_air_quality(latitude, longitude)

    lag_1, lag_2, lag_3, lag_7, lag_14 = lags

    features = (
        [
            pollutants["PM10_ug_m3"],
            pollutants["NO_ug_m3"],
            pollutants["NO2_ug_m3"],
            pollutants["NOx_ppb"],
            pollutants["NH3_ug_m3"],
            pollutants["SO2_ug_m3"],
            pollutants["CO_mg_m3"],
            pollutants["Ozone_ug_m3"],
            pollutants["Benzene_ug_m3"],
            pollutants["Toluene_ug_m3"],
            weather["Temp_degree_C"],
            weather["RH_"],
            weather["WS_m_s"],
            weather["WD_deg"],
            weather["SR_W_mt2"],
            weather["VWS_m_s"],
            pollutants["Xylene_ug_m3"],
            weather["RF_mm"],
            weather["AT_degree_C"],
        ]
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
