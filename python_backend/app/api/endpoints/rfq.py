from fastapi import APIRouter
from pydantic import BaseModel
from api.queries import request_for_quote, vacation_requests
from api.queries import item
from api.endpoints.scripts.send_email import get_item_dict, get_item_pks, sort_items_in_groups
from api.endpoints.data import RfqItemDetails
from typing import List, Literal, Dict


router = APIRouter()



@router.get("/search-rfq/{rfq_num}")
def search_for_rfq(rfq_num: int):
    """
    Get all RequestForQuotePKs: CustomerRequestForQuoteNumber from RequestForQuote
    """
    return {
        "result": {
            rfq_pk: cust_rfq_num
            for rfq_pk, cust_rfq_num in request_for_quote.search_for_rfqs(rfq_num)
        }
    }


@router.get("/rfq-details/{rfq_pk}")
def get_quote_items_from_rfq(rfq_pk: int):
    """
    Get all RFQ line items and group them by commodity code.
    For each code, retrieve associated email recipients.
    Return grouped items and items missing codes.

    :param rfq_pk: Primary key of the RFQ.
    """
    rfq_line_items = sort_items_in_groups(get_item_dict(get_item_pks(rfq_pk)))
    return rfq_line_items


@router.get("/get-commodity-codes")
def get_commodity_codes():
    codes = [code[0] for code in item.get_all_commodity_codes()]  # normalize
    return {"codes": codes}


@router.get("/get-vacation-requests")
def get_vacation_requests():
    data = vacation_requests.get_all_vacation_requests()
    return {"data": data}


@router.post("/approve-request/{id}")
def approve_request(id: int):
    try:
        vacation_requests.approve_vacation_request(id)
        return {"statue": True}
    except Exception as e:
        # TODO: throw proper error bruh.
        print(f"error: {e}")


@router.get("/get-email-groups")
def get_email_groups():
    """ Returns all emails that belong to the following groups
        'material', 'hardware', 'op', 'tooling'. 
        {'material': <values>, 'op': <values> ...}
     """
    return request_for_quote.get_emails_for_op_items()


class SendMailRequest(BaseModel):
    rfq_line_items: Dict[int, RfqItemDetails]
    email_groups: Dict[Literal["fin", "mat-al", "mat-steel", "ht", "hardware"], List[str]]


# TODO: this should be done via IPC on electron itself.
@router.post("/send-mail")
def send_mail(send_mail_request: SendMailRequest):
    pass

