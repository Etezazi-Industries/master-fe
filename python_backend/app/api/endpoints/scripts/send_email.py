from api.endpoints.data import RFQItem, RfqItemDetails
from typing import List, Dict
from api.queries import request_for_quote, item, quote
from collections import defaultdict
import json


#TODO: fix the type to be a list of rfqitemdetails.


# NOTE: for RFQ send mail - rfq_number, other_attachment, fin_attachment

BASE_URLS = {
    "Material": r"https://www.cognitoforms.com/AEManagementEtezaziIndustries/MaterialQuoteForm?entry=",
    "Finish": r"https://www.cognitoforms.com/AEManagementEtezaziIndustries/Finish?entry=",
    "Hardware": r"https://www.cognitoforms.com/AEManagementEtezaziIndustries/Hardware?entry=",
    "HeatTreat": r"https://www.cognitoforms.com/AEManagementEtezaziIndustries/HeatTreat?entry=",
}


class Payload:
    def __init__(self, ):
        self.payload = {
            "Material": {} ,
            "Finish": {},
            "Hardware": {},
            "HeatTreat": {},
        }
        self.urls = {
            "Material": r"",
            "Finish": r"",
            "Hardware": r"",
            "HeatTreat": r"",
        }
        self.urls_valid = False


def send_email(rfq_number=None, other_attachment = [], item_id=None, qty_req=None, fin_attachment = []):
    # FOR LIVE:
    # email_dict: Dict[str, List] = get_emails_for_op_items()

    # TESTING:
    email_dict = {
        'mat-al': ['siddharth.vyas619@gmail.com'],
        'fin': ['siddharth.vyas619@gmail.com'],
        'hardware': ['siddharth.vyas619@gmail.com'],
    }
    # generate Cognito forms
    cognito_forms_links = [] 


def get_item_pks(rfq_pk: int) -> List[RFQItem]:
    """
    Gets the ItemPKs of all items in the RFQ and aggregates the quantities needed.

    :param rfq_pk: PK in the RFQ table in MT.
    :return: {<itemfk>: <total qty>}
    :raises ValueError: When no data is returned or no qty is returned from one of them items (line items).
    """
    quote_fk_list = request_for_quote.get_item_pks(rfq_pk)

    # TODO: To Test, do we even need this?
    qty_none_buf: list[int] = [fk for fk, qty in quote_fk_list if not qty]
    if not quote_fk_list:
        raise ValueError()

    if len(qty_none_buf) > 1:
        raise ValueError()

    item_fks_dict = defaultdict(int)
    for fk, quantity in quote_fk_list:
        item_pks = quote.get_quote_items_qty(fk)

        if not item_pks:
            continue

        for item_fk, qty_required in item_pks:
            if qty_required is not None:
                item_fks_dict[item_fk] += qty_required * quantity

    return [
        RFQItem(
            item_pk=item_fk,
            part_number=item.get_item_info(item_fk)[0],
            qty=qty,
            code=item.get_commodity_code(item_fk),)
        for item_fk, qty in item_fks_dict.items() if item_fk
    ]


def get_item_dict(rfq_item_list: List[RFQItem]) -> Dict[int, RfqItemDetails]: 
    """
    Fetches the data of items in the Item table in MT.
    Returns a dict with ItemPK: {<column name>: value}. NOTE: QuantityRequired is a key.

    :param item_fks_dict: Dict: ItemFK: Qty Required
    """
    item_dict = {}
    for fk in rfq_item_list:
        details = item.get_item_info(fk.item_pk)
        if details:
            item_details = RfqItemDetails(
                Description=str(details[4]),
                ItemTypeFK=details[5],
                PartLength=float(details[6]) if details[6] else None,
                PartNumber=details[0],
                PartWidth=float(details[7])if details[7] else None,
                PurchaseOrderComment=details[8],
                QuantityRequired=fk.qty,
                StockLength=details[1],
                StockWidth=details[2],
                Thickness=details[3],
                Category=None,
                EmailCategory=None,
            )
            item_dict[fk.item_pk] = item_details
    return item_dict


def sort_items_in_groups(item_dict: Dict[int, RfqItemDetails]):
    """Identifies item type and then appends the category as a key, value pair to the item_dict."""
    categories = ["standard", "mat", "hardware", "msc", "fin", "kit", "tooling"]

    for value in item_dict.values():
        item_type_index = value.ItemTypeFK - 1  # to get the corresponding index in categories
        category = categories[item_type_index]

        part_number_split = value.PartNumber.lower().split()
        email_category = None  # Initialize email_category to avoid reference before assignment

        if category == "fin":
            if "ht" in part_number_split or "heat" in part_number_split:
                email_category = "ht"
            else:
                email_category = "fin"
        elif category in ["hardware", "tooling"]:
            email_category = "hardware"
        elif category == "mat":
            if "al" in part_number_split:
                email_category = "mat-al"
            elif "steel" in part_number_split or "st" in part_number_split:
                email_category = "mat-steel"
            else:
                email_category = "mat-al"
        else:
            email_category = "mat-al"  # Default email_category to the category if not specified

        value.Category = category
        value.EmailCategory = email_category
 
    return item_dict


def create_cognito_forms_links(item_dict: Dict[int, RfqItemDetails]):
    material_payload = {
        "PartsRequired": [part.material() for part in item_dict.values() if part.EmailCategory and part.EmailCategory.startswith("mat")],
        "SupplierFill": [{"PartNumber": part.PartNumber} for part in item_dict.values()]
    }
    json_str = json.dumps(material_payload, separators=(",", ":"))

    material_parts = BASE_URLS["Material"] + json_str

    fin_payload = {
        "PartsRequired": [part.fin() for part in item_dict.values() if part.EmailCategory and part.EmailCategory.startswith("fin")],
        "SupplierFill": [{"PartNumber": part.PartNumber} for part in item_dict.values()]
    }
    json_str = json.dumps(fin_payload, separators=(",", ":"))

    finish_parts: str = BASE_URLS["Finish"] + json_str

    hardware_payload = {
        "PartsRequired": [part.fin() for part in item_dict.values() if part.EmailCategory and part.EmailCategory.startswith("hardware")],
        "SupplierFill": [{"PartNumber": part.PartNumber} for part in item_dict.values()]
    }
    json_str = json.dumps(hardware_payload, separators=(",", ":"))

    hardware_parts: str = BASE_URLS["Hardware"] + json_str

    ht_payload = {
        "PartsRequired": [part.fin() for part in item_dict.values() if part.EmailCategory and part.EmailCategory.startswith("ht")],
        "SupplierFill": [{"PartNumber": part.PartNumber} for part in item_dict.values()]
    }
    json_str = json.dumps(ht_payload, separators=(",", ":"))

    ht_parts = BASE_URLS["HeatTreat"] + json_str

    payload = Payload()
    payload.payload["HeatTreat"] = ht_payload
    payload.payload["Material"] = material_payload
    payload.payload["Hardware"] = hardware_payload
    payload.payload["Finish"] = fin_payload

    payload.urls["HeatTreat"] = ht_parts
    payload.urls["Material"] = material_parts
    payload.urls["Hardware"] = hardware_parts
    payload.urls["Finish"] = finish_parts

    return payload

