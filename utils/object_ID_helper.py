from bson import ObjectId
from bson.errors import InvalidId


def convert_mongo_id_to_str_doc(doc: dict) -> dict:
    """Convert Mongo's ObjectId `_id` to string so Pydantic can handle it."""
    if doc is None:
        return doc
    doc = dict(doc)  # copy so we don't mutate the original
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


def convert_str_id_to_mongo_id_doc(doc: dict) -> dict:
    """
    Convert str id to ObjectId to search MongoDB's database
    """
    if doc is None:
        return doc
    doc = dict(doc)  # copy so we don't mutate the original
    if "_id" in doc and isinstance(doc["_id"], str):
        doc["_id"] = ObjectId(doc["_id"])
    return doc


def str_to_object_id(val: str) -> ObjectId | None:
    """
    Docstring for str_to_object_id

    :param val: Description
    :type val: str
    :return: Description
    :rtype: ObjectId | None
    """
    if val is None:
        return None
    if isinstance(val, ObjectId):
        return val

    try:
        return ObjectId(val)
    except (InvalidId, TypeError):
        return None


def object_id_to_str(val: ObjectId) -> str | None:
    """
    Docstring for object_id_to_str

    :param val: Description
    :type val: ObjectId
    :return: Description
    :rtype: str | None
    """
    if val is None:
        return None
    if isinstance(val, str):
        return val
    try:
        return str(val)
    except Exception:
        return None