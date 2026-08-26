import pytest
from fastapi import HTTPException

from app.core.security import verify_api_key
from app.core.config import settings


def test_api_routes_require_api_key():
    with pytest.raises(HTTPException) as error:
        verify_api_key(None)

    assert error.value.status_code == 401


def test_api_key_is_accepted():
    verify_api_key(settings.API_KEY)