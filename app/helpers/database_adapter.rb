require 'mongo_mapper'
require 'mongo'
require_relative '../models/mongo_models/doctor'
require_relative '../models/mongo_models/field'
require_relative '../models/mongo_models/icd_entry'

include Mongo

# This connects to the real database and retrieves requested basic information. We do not compute compound information here.
class DatabaseAdapter
  def initialize
    host = MongoMapper.connection.host
    port = MongoMapper.connection.port

    @client = MongoClient.new(host, port)
  end


  def get_fields_for_icd_code_by_bing_rank(icd_code, count)
    db = @client['relationFSZuICD']
    col = db['relationFSZuICD']
    col.find({icd_code: code}, fields: [:icd_fs_bing_de,:fs_code], sort: {icd_fs_bing_de: 'descending'}).limit(count)
  end

  def get_drgs(code)
    db = @client['icd_2012_ch']
    col = db['de']
    doc = col.find_one({code: code})
    drgs = doc['drgs']
  end

  def get_icd(code, language)
    db = @client['icd_2012_ch']
    col = db[language]
    doc = col.find_one({code: code})
  end

  def get_fmhs(code)
    db = @client['mdc']
    col = db['mdcCodeToFSCode']
    documents = col.find({mdc_code: code.to_s})
    fmhs = []
    documents.each do |document|
      fmhs << document['fs_code']
    end

    fmhs
  end

  # @return The MDC Code (1-23) associated with the given DRG prefix (A-Z).
  def get_mdc(drg_prefix)
    db = @client['mdc']
    col = db['mdcNames']
    document=col.find_one({drgprefix: drg_prefix})
    document['code']
  end


  def get_fmh_name (fmh, language)
    db = @client['fachgebieteUndSpezialisierungen']
    col = db['fachgebieteUndSpezialisierungen']
    document = col.find_one({code: fmh.to_i})
    document["#{language}"]

  end

end