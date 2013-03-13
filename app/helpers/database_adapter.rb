require 'mongo_mapper'
require_relative '../models/api/doctor'
require_relative '../models/api/field'
require_relative '../models/api/icd_entry'

class DatabaseAdapter
  #abstract all database access here
end