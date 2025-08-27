from fastapi import APIRouter, Response
from fastapi.exceptions import HTTPException
from api.queries import dashboards, quickview, user
from base_logger import getlogger
from typing import Dict, List


router = APIRouter()
LOGGER = getlogger("DB-QV-Access")


@router.get("/users")
def get_users() -> Dict[int, List[str]]:
    return user.get_user_data()


@router.get("/quickviews")
def get_quickviews():
    return quickview.get_all_quickviews()


@router.get("/users/{user_id}/access/quickviews")
def get_current_usr_access_quickviews(user_id: int):
    try:
        return quickview.get_user_quick_view(user_id)
    except Exception as e:
        LOGGER.error(e.with_traceback(None))  # TODO: 
        return HTTPException(status_code=500)


# NOTE: Batch supported - change it to take quickviews, dashboards in body.
@router.put("/users/{user_id}/access/quickviews/{quickview_id}")
def grant_quickview_access(user_id: int, quickview_id: int):
    try:
        get_or_create = quickview.add_quickview_to_user(quickview_id, user_id)
        inst = type(get_or_create)
        LOGGER.info(f"{inst}")
        return Response(status_code=204)
    except Exception as e:
        LOGGER.error(e.with_traceback(None))  # TODO: 
        raise HTTPException(status_code=500)


@router.delete("/users/{user_id}/access/quickviews/{quickview_id}")
def revoke_quickview_access(user_id: int, quickview_id: int):
    try:
        quickview.delete_quickview_from_user(user_id, quickview_id)
        LOGGER.info(f"Success: UserID: {user_id} added to Quickview ID: {quickview_id}")
        return Response(status_code=204)
    except Exception as e:
        print(e.with_traceback(None))  # TODO: 
        raise HTTPException(status_code=500)


@router.get("/dashboards")
def get_dashboards():
    return dashboards.get_all_dashboards()


@router.get("/users/{user_id}/access/dashboards")
def get_current_usr_access_dashboards(user_id: int):
    try:
        return dashboards.get_user_dashboards(user_id)
    except Exception as e:
        LOGGER.error(e.with_traceback(None))  # TODO: 
        return HTTPException(status_code=500)


@router.put("/users/{user_id}/access/dashboards/{dashboard_id}")
def grant_dashboard_access(user_id: int, dashboard_id: int):
    try:
        get_or_create = dashboards.add_dashboard_to_user(dashboard_id, user_id)
        inst = type(get_or_create)
        LOGGER.info(f"{inst}")
        return Response(status_code=204)
    except Exception as e:
        LOGGER.error(e.with_traceback(None))  # TODO: 
        raise HTTPException(status_code=500)


@router.delete("/users/{user_id}/access/dashboards/{dashboard_id}")
def revoke_dashboard_access(user_id: int, dashboard_id: int):
    try:
        dashboards.delete_dashboard_from_user(user_id, dashboard_id)
        LOGGER.info(f"Success: UserID: {user_id} added to Dashboard ID: {dashboard_id}")
        return Response(status_code=204)
    except Exception as e:
        LOGGER.error(e.with_traceback(None))  # TODO: 
        raise HTTPException(status_code=500)

