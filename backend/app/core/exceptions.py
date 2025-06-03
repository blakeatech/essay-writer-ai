from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Any, Optional

class EssayGeneratorException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: Optional[dict[str, str]] = None,
    ) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class RateLimitExceeded(EssayGeneratorException):
    def __init__(self):
        super().__init__(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )

class InvalidInputError(EssayGeneratorException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=400,
            detail=detail
        )

class APIError(EssayGeneratorException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=500,
            detail=detail
        )

async def essay_generator_exception_handler(
    request: Request,
    exc: EssayGeneratorException
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": exc.__class__.__name__
            }
        }
    )

async def general_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "An unexpected error occurred",
                "type": "InternalServerError"
            }
        }
    ) 