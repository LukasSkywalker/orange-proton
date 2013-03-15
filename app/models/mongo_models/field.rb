require 'mongo_mapper'

class Field
  include MongoMapper::Document
  set_database_name 'fachgebieteUndSpezialisierungen'
  set_collection_name 'fachgebieteUndSpezialisierungen'
end