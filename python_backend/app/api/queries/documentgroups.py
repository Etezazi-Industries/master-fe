from utils import with_db_conn
from typing import Tuple, List


@with_db_conn()
def get_all_document_groups(cursor) -> List[Tuple[str, int]]:
    """
    Returns a list of code, DocumentGroupPK for all document groups inside DB.

    :return: [<code>, <DocumentGroupPK>]
    """

    query = "SELECT Code, DocumentGroupPK FROM DocumentGroup"
    cursor.execute(query)
    return cursor.fetchall()
