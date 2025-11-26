from bson import ObjectId
from flask import jsonify

def to_objectid(id_str):
  """Converts string to objectID or returns None"""
  try:
    return ObjectId(id_str)
  except Exception:
    return None

def obj_to_json(doc):
  """Convert _id fields and nested ObjectId to strings for JSON response."""
  if not doc:
    return None
  # conversion 
  if "_id" in doc:
    doc["_id"] = str(doc["_id"])
  # if user_id exists, convert
  if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
    doc["user_id] = str(doc["user_id"])
  return doc
  
