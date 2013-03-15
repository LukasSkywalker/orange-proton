require 'mongo_mapper'
require 'mongo'
require_relative '../models/mongo_models/doctor'
require_relative '../models/mongo_models/field'
require_relative '../models/mongo_models/icd_entry'

include Mongo

class DatabaseAdapter
  def initialize
    host = MongoMapper.connection.host
    port = MongoMapper.connection.port

    @client = MongoClient.new(host, port)
  end

  def get_fields_by_bing_rank(code, count)
    db = @client['relationFSZuICD']
    col = db['relationFSZuICD']
    col.find({icd_code: code}, fields: [:icd_fs_google_de,:fs_code], sort: {icd_fs_google_de: 'descending'}).limit(count)
  end
end