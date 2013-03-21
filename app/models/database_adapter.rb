# This connects to the real database and retrieves requested basic information. We do not compute compound information here.
class DatabaseAdapter
  def initialize
    host = MongoMapper.connection.host
    port = MongoMapper.connection.port

    # See http://stackoverflow.com/a/13995525
    @client = Mongo::Connection.new(host, port)

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
    return doc['drgs'] unless doc.nil?
    []
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

  # @return An array of available thesaurName s
  def get_available_thesaur_names()
    a = @client['thesauren'].collection_names
    a.delete('thesaurusToFSCode')
    a.delete('thesaurusToFSCode2')
    a.delete('system.indexes')
    return a
  end

  # @param thesaurName any of the names returned by get_available_thesaur_names()
  def is_icd_code_in_thesaur_named?(icd_code, thesaurName)
    return @client['thesauren'][thesaurName].find_one({icd_code: icd_code}) != nil
  end

  def get_fs_codes_for_thesaur_named(thesaurName)
      a = @client['thesauren']['thesaurusToFSCode2'].find({
                                                         thesaurName: thesaurName},
                                                         fields: {:fs_code => 1, :_id => 0})
      fs_codes= []
      a.each {|fs|
          fs_codes << fs["fs_code"]
      }
      return fs_codes
  end

  # @return The MDC Code (1-23) associated with the given DRG prefix (A-Z).
  def get_mdc_code(drg_prefix)
    db = @client['mdc']
    col = db['mdcNames']
    document=col.find_one({drgprefix: drg_prefix})
    document['code']
  end

  # @return The name of a Fachgebiet/Spezialisierung of the given code in the language specified.
  def get_fs_name(fs_code, language)
    document = @fs.find_one({code: fs_code.to_i})
    document[language]
  end

end
