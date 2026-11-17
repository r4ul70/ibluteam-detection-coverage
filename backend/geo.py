                                                                                                      

                                                                        
                                                                                                           
   
import ipaddress

from .database import DATA_DIR

_CANDIDATES = ["GeoLite2-City.mmdb", "dbip-city-lite.mmdb", "city.mmdb"]
_reader = None
_tried = False


def _open():
    global _reader, _tried
    if _tried:
        return _reader
    _tried = True
    try:
        import maxminddb                
    except ImportError:
        return None
    for name in _CANDIDATES:
        path = DATA_DIR / name
        if path.exists():
            try:
                _reader = maxminddb.open_database(str(path))
                break
            except Exception:                                   
                _reader = None
    return _reader


def status() -> dict:
    try:
        import maxminddb                              

        lib = True
    except ImportError:
        lib = False
    return {"library": lib, "database": _open() is not None}


def is_public(ip: str) -> bool:
    try:
        a = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return not (a.is_private or a.is_loopback or a.is_link_local or a.is_reserved or a.is_multicast or a.is_unspecified)


def lookup(ip: str):
    """(lat, lon, 'Şəhər, Ölkə') və ya None."""
    r = _open()
    if not r or not is_public(ip):
        return None
    try:
        rec = r.get(ip) or {}
        loc = rec.get("location") or {}
        if loc.get("latitude") is None or loc.get("longitude") is None:
            return None
        city = ((rec.get("city") or {}).get("names") or {}).get("en", "")
        country = ((rec.get("country") or {}).get("names") or {}).get("en", "")
        place = ", ".join(x for x in (city, country) if x)
        return float(loc["latitude"]), float(loc["longitude"]), place
    except Exception:                
        return None
