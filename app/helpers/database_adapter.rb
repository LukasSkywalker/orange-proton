require 'mongo_mapper'
require 'mongo'

include Mongo

class DatabaseAdapter
  def initialize
    host = MongoMapper.connection.host
    port = MongoMapper.connection.port

    @client = MongoClient.new(host, port)

    @icd = {
        :de => @client['icd_2012_ch']['de'],
        :fr => @client['icd_2012_ch']['fr'],
        :it => @client['icd_2012_ch']['it']
    }

    @fs = @client['fachgebieteUndSpezialisierungen']['fachgebieteUndSpezialisierungen']

    @r_icd_fs = @client['relationFSZuICD']['relationFSZuICD']
    @r_mdc_fs = @client['mdc']['mdcCodeToFSCode']
  end

  def get_fields_by_bing_rank(icd_code, count)
    @r_icd_fs.find({icd_code: icd_code}, fields: [:icd_fs_bing_de,:fs_code],
                   sort: {icd_fs_bing_de: 'descending'}).limit(count)
  end

  def get_drgs(icd_code)
    doc = @icd[:de].find_one({code: icd_code})
    doc['drgs']
  end

  def get_icd(icd_code, language)
    @icd[language.to_sym].find_one({code: icd_code})
  end

  def get_fs_code(mcd_code)
    documents = @r_mdc_fs.find({mdc_code: mcd_code.to_s})
    fmhs = []
    documents.each do |document|
      fmhs << document['fs_code']
    end
    fmhs
  end

  def get_mdc_code(drg_prefix)
    db = @client['mdc']
    col = db['mdcNames']
    document=col.find_one({drgprefix: drg_prefix})
    document['code']
  end

  def get_fs_name(fs_code, language)
    document = @fs.find_one({code: fs_code.to_i})
    document[language]
  end
end