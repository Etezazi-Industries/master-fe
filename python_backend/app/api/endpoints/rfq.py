from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
from collections import defaultdict
from api.queries import request_for_quote, quote


router = APIRouter()


class RFQLineItem(BaseModel):
    part_number: str
    line_reference_number: int
    quote_fk: int | None  # FIX: should never be none


@router.get("/rfq/{rfq_pk}")
async def get_rfq_lines(rfq_pk: int):
    rows = request_for_quote.get_rfq_line_items(rfq_pk)
    print(rows)
    return [
        RFQLineItem(
            part_number=row.PartNumber,
            line_reference_number=row.LineReferenceNumber,
            quote_fk=row.QuoteFK,
        )
        for row in rows
    ]


def get_item_pks(rfq_pk: int) -> dict:
    """
    Gets the ItemPKs of all items in the RFQ and aggregates the quantities needed.

    :param rfq_pk: PK in the RFQ table in MT.
    :return: {<itemfk>: <total qty>}
    :raises ValueError: When no data is returned or no qty is returned from one of them items (line items).
    """
    quote_fk_list = request_for_quote.get_item_pks(rfq_pk)
    qty_none_buf: list[int] = [fk for fk, qty in quote_fk_list if not qty]

    if not quote_fk_list:
        return HTTPException(
            status_code=404, detail=f"QuoteFK missing for FKs: \n {qty_none_buf}"
        )  # type: ignore

    if len(qty_none_buf) > 1:
        return HTTPException(
            status_code=404, detail=f"Quantity missing for FKs: \n {qty_none_buf}"
        )  # type: ignore

    item_fks_dict = defaultdict(int)
    for fk, quantity in quote_fk_list:
        item_pks = quote.get_quote_items_qty(fk)

        if not item_pks:
            continue

        for item_fk, qty_required in item_pks:
            if qty_required is not None:
                item_fks_dict[item_fk] += qty_required * quantity

    return item_fks_dict


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
