require 'mongo_mapper'
require_relative '../models/mongo_models/doctor'
require_relative '../models/mongo_models/field'
require_relative '../models/mongo_models/icd_entry'

class DatabaseAdapter
  #abstract all database access here
end