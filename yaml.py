                                                                           
from __future__ import annotations

from io import StringIO
from typing import Any, Iterator, Optional, TextIO, Union

from ruamel.yaml import YAML
from ruamel.yaml.error import YAMLError

__all__ = ["YAMLError", "safe_dump", "safe_load", "safe_load_all"]

Stream = Union[str, bytes, TextIO]


def _safe_yaml() -> YAML:
    y = YAML(typ="safe", pure=True)
    y.default_flow_style = False
    y.allow_unicode = True
    return y


def safe_load(stream: Stream) -> Any:
                                                                                
    return _safe_yaml().load(stream)


def safe_load_all(stream: Stream) -> Iterator[Any]:
                                                       
    return _safe_yaml().load_all(stream)


def safe_dump(
    data: Any,
    stream: Optional[TextIO] = None,
    *,
    sort_keys: bool = True,
    allow_unicode: bool = False,
    **_ignored: Any,
) -> Optional[str]:
                                                                          
    y = _safe_yaml()
    y.allow_unicode = allow_unicode
                                                                       
    if sort_keys and isinstance(data, dict):
        data = {k: data[k] for k in sorted(data, key=lambda x: str(x))}

    if stream is None:
        buf = StringIO()
        y.dump(data, buf)
        return buf.getvalue()
    y.dump(data, stream)
    return None
