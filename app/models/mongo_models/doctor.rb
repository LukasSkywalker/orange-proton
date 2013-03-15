require 'mongo_mapper'

class Doctor
  include MongoMapper::Document
  set_database_name 'doctors'
  set_collection_name 'doctors'
end