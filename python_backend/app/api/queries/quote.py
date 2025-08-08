import pyodbc
from typing import Dict, Tuple, List
from api.queries.utils import with_db_conn


SOURCE_QUOTE = 494  # WARNING: change this to 494


@with_db_conn(commit=True)
def create_quote_new(
    cursor: pyodbc.Cursor,
    customer_fk: int,
    item_fk: int,
    quote_type: int,
    part_number: str,
) -> int:
    """
    Inserts a new quote record for the given item. Linked using ItemFK inside quote table.

    :raises ValueError: If the database fails to return the primary key for the newly inserted quote.
    :return: The primary key of the newly inserted quote.
    """
    query = """
        INSERT INTO Quote (CustomerFK, ItemFK, QuoteType, PartNumber, DivisionFK)
        VALUES (?, ?, ?, ?, ?);
    """
    cursor.execute(query, (customer_fk, item_fk, quote_type, part_number, 1))
    cursor.execute("SELECT IDENT_CURRENT('Quote');")
    result = cursor.fetchone()

    if not result or result[0] is None:
        raise ValueError("Quote PK was not returned by the database.")

    return int(result[0])


@with_db_conn(commit=True)
def copy_operations_to_quote(
    cursor: pyodbc.Cursor,
    new_quote_fk,
    source_quote_fk=SOURCE_QUOTE,
):
    """
    Copies operations from one quote to another in the QuoteAssembly table.

    This function duplicates selected columns from the QuoteAssembly records associated
    with the source quote and inserts them for the new quote. Certain columns and the BOM are excluded
    from the copy.

    Parameters:
        cursor (pyodbc.Cursor): The database cursor used to execute SQL queries.
        new_quote_fk (int): The foreign key of the new quote to which operations will be copied.
        source_quote_fk (int, optional): The foreign key of the quote from which operations
            will be copied. Defaults to the constant SOURCE_QUOTE.

    """

    all_columns = get_table_schema("QuoteAssembly")
    excluded_columns = [
        "QuoteFK",
        "QuoteAssemblyPK",
        "LastAccess",
        "ParentQuoteAssemblyFK",
        "ParentQuoteFK",
    ]

    columns_to_copy = [
        column.get("column_name")
        for column in all_columns
        if column.get("column_name") not in excluded_columns
    ]
    column_names = ", ".join(columns_to_copy)

    query = f"""
        INSERT INTO QuoteAssembly ({column_names}, QuoteFK)
        SELECT {column_names}, ?
        FROM QuoteAssembly
        WHERE QuoteFK = ?
        AND ItemFK IS NULL;
    """
    cursor.execute(query, (new_quote_fk, source_quote_fk))


@with_db_conn(commit=True)
def add_comments(cursor, new_quote_fk, comments_dict):
    comments_query = f"""
        SELECT
            qa.QuoteAssemblyPK,
            op.Name,
            wc.Description AS WorkcenterDescription
        FROM
            QuoteAssembly qa
        LEFT JOIN
            Operation op ON qa.OperationFK = op.OperationPK
        LEFT JOIN
            Workcenter wc ON op.WorkcenterFK = wc.WorkcenterPK
        WHERE
            qa.QuoteFK = ?;
    """
    cursor.execute(comments_query, (new_quote_fk,))
    operation_names = cursor.fetchall()  # these were just added above

    for pk, op, wc_description in operation_names:
        if op in comments_dict or wc_description in comments_dict:
            key = op if op in comments_dict else wc_description
            insert_comment_query = f"""
                UPDATE QuoteAssembly
                SET Comment = ?
                WHERE QuoteAssemblyPK = ?
            """
            comment = comments_dict[key]
            cursor.execute(insert_comment_query, (comment, pk))


@with_db_conn()  # FOR TESTING
def get_operations(cursor, quote_pk):
    query = """
        SELECT 
            o.Name
        FROM
            QuoteAssembly AS qa
            INNER JOIN Operation AS o
                ON qa.OperationFK = o.OperationPK
        WHERE
            qa.QuoteFK = ?;
            """

    cursor.execute(query, (quote_pk,))
    return cursor.fetchall()


@with_db_conn()
def get_operation_quote_template(cursor: pyodbc.Cursor, quote_fk: int = 494):
    """
    Retrieves operation data for a given quote, excluding certain metadata columns.

    This function fetches the values of selected columns from the QuoteAssembly table
    for a specified quote. Certain columns such as primary keys and parent references
    are excluded from the results. The function returns both the list of included
    column names and the corresponding row values.

    Parameters:
        cursor (pyodbc.Cursor): The database cursor used to execute SQL queries.
        quote_fk (int, optional): The foreign key of the quote whose operations are to be retrieved.
            Defaults to 494.

    Returns:
        tuple[list[str], list[tuple]]: A tuple containing:
            - A list of column names included in the result.
            - A list of row tuples representing the data for each operation.
    """
    all_columns = get_table_schema("QuoteAssembly")
    excluded_columns = [
        "QuoteFK",
        "QuoteAssemblyPK",
        "LastAccess",
        "ParentQuoteAssemblyFK",
        "ParentQuoteFK",
    ]

    columns_to_copy = [
        str(column.get("column_name"))
        for column in all_columns
        if column.get("column_name") not in excluded_columns
    ]
    column_names = ", ".join(columns_to_copy)  # Convert list to SQL-friendly format

    query = f"SELECT {column_names} FROM QuoteAssembly WHERE QuoteFK=?"
    cursor.execute(query, (quote_fk,))
    template_values = cursor.fetchall()

    return columns_to_copy, template_values


@with_db_conn()
def get_all_quote_templates(cursor: pyodbc.Cursor) -> List[Tuple[str, int]]:
    query = """
        SELECT 
            quote.quotepk,
            item.PartNumber
        FROM 
            quote
        INNER JOIN 
            item
            ON quote.itemfk = item.itempk
        WHERE
            item.PartNumber LIKE '%template';
    """
    cursor.execute(query)
    return [(part_num, quote_pk) for part_num, quote_pk in cursor.fetchall()]


@with_db_conn()
def get_quote_assembly_pk(cursor: pyodbc.Cursor, **quote_details) -> int | None:
    """
    Retrieves the primary key of a QuoteAssembly record that matches the provided conditions.

    This function builds a dynamic SQL query using the keyword arguments passed in
    `quote_details` to filter records in the QuoteAssembly table. It returns the primary key
    (QuoteAssemblyPK) of the first matching record, or None if no match is found.

    Parameters:
        cursor (pyodbc.Cursor): The database cursor used to execute SQL queries.
        **quote_details: Arbitrary keyword arguments representing column-value pairs
            to use as filter conditions in the WHERE clause.

    Returns:
        int | None: The primary key (QuoteAssemblyPK) of the matching record, or None
        if no match is found.

    Raises:
        ValueError: If no filter conditions are provided.
    """
    if not quote_details:
        raise ValueError("At least one condition must be provided to get an item.")

    where_conditions = " AND ".join([f"{key} = ?" for key in quote_details.keys()])
    query = f"SELECT QuoteAssemblyPK FROM QuoteAssembly WHERE {where_conditions};"

    values = tuple(quote_details.values())

    cursor.execute(query, values)
    result = cursor.fetchone()

    return result[0] if result else None


@with_db_conn(commit=True)
def create_quote_assembly_formula_variable(cursor: pyodbc.Cursor, quote_pk):
    """Inserts operation values used to calculate the setup times and scheduling for the quote."""
    query = """
        INSERT INTO QuoteAssemblyFormulaVariable
            (QuoteAssemblyFK, OperationFormulaVariableFK, FormulaType, VariableValue)
        SELECT
            QuoteAssemblyPK, SetupFormulaFK, 0, SetupTime
        FROM QuoteAssembly
        WHERE QuoteFK = ? AND OperationFK IS NOT NULL

        UNION ALL

        SELECT
            QuoteAssemblyPK, RunFormulaFK, 1, RunTime
        FROM QuoteAssembly
        WHERE QuoteFK = ? AND OperationFK IS NOT NULL
    """

    cursor.execute(query, (quote_pk, quote_pk))


@with_db_conn()
def get_quote_assembly_formula_variable(cursor: pyodbc.Cursor, quote_pk: int):
    query = """
        SELECT
            v.QuoteAssemblyFK,
            v.OperationFormulaVariableFK,
            v.FormulaType,
            v.VariableValue
        FROM QuoteAssemblyFormulaVariable AS v
        INNER JOIN QuoteAssembly AS a
          ON a.QuoteAssemblyPK = v.QuoteAssemblyFK
        WHERE a.QuoteFK = ? 
          AND a.OperationFK IS NOT NULL
    """
    conn = cursor.execute(query, (quote_pk,))
    return conn.fetchall()


@with_db_conn(commit=True)
def create_assy_quote(
    cursor: pyodbc.Cursor,
    quote_to_be_added,
    quotefk,
    qty_req=1,
    parent_quote_fk=None,
    parent_quote_asembly=None,
    source_quote=494,
):
    """
    Creates Quote for Assembly parts by inserting a new QuoteAssembly record and copying related operations.
    """
    insert_query = """
        INSERT INTO QuoteAssembly
        (QuoteFK, ItemQuoteFK, SequenceNumber, Pull, Lock, OrderBy, QuantityRequired, ParentQuoteFK, ParentQuoteAssemblyFK)
        VALUES (?, ?, 1, 0, 0, 1, ?, ?, ?);
    """

    cursor.execute(
        insert_query,
        (quotefk, quote_to_be_added, qty_req, parent_quote_fk, parent_quote_asembly),
    )
    cursor.execute("SELECT IDENT_CURRENT('QuoteAssembly');")
    result = cursor.fetchone()

    if not result or result[0] is None:
        raise ValueError("Quote PK was not returned by the database.")

    pk = int(result[0])

    # get quote operation template:
    column_names, template_values = get_operation_quote_template(source_quote)
    for data in template_values:
        insert_dict = dict(zip(column_names, data))
        insert_dict["QuoteFK"] = quotefk
        insert_dict["ParentQuoteAssemblyFK"] = pk
        insert_dict["ParentQuoteFK"] = quote_to_be_added

        insert_columns = ", ".join(insert_dict.keys())
        placeholders = ", ".join(["?"] * len(insert_dict))
        insert_query = (
            f"INSERT INTO QuoteAssembly ({insert_columns}) VALUES ({placeholders})"
        )

        cursor.execute(insert_query, tuple(insert_dict.values()))

    return pk


@with_db_conn()
def get_quote_items_qty(cursor: pyodbc.Cursor, quote_fk: int):
    query = """
    SELECT ItemFK, QuantityRequired FROM QuoteFK WHERE QuoteFK=?
    """
    cursor.execute(query, (quote_fk))
    return cursor.fetchall()

