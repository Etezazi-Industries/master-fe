from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from api.queries import user


class LoginRequest(BaseModel):
    username: str
    password: str


router = APIRouter()


@router.post("/login")
async def login(req: LoginRequest):
    ok: bool = user.login_user(req.username, req.password)
    if not ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    return {"Login Status": True}
