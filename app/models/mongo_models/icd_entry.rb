require 'mongo_mapper'

class IcdEntry
  include MongoMapper::Document
  set_database_name 'icd_2012_ch'
  set_collection_name 'de'
end