from fastapi import FastAPI
from api.endpoints.rfq import router as rfq_router
from api.endpoints.login import router as login_router
from api.endpoints.db_qv_access import router as db_qv_router


app = FastAPI()
app.include_router(rfq_router)
app.include_router(login_router)
app.include_router(db_qv_router)


@app.get("/")
def read_root():
    return {"status": "ok"}
