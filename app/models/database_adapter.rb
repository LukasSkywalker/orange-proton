# This connects to the real database and retrieves requested basic information. We do not compute compound information here.
class DatabaseAdapter
  def initialize
    host = MongoMapper.connection.host
    port = MongoMapper.connection.port

    # See http://stackoverflow.com/a/13995525
    @client = Mongo::Connection.new(host, port)
    @client['admin'].authenticate("pse4_read", "plokij")

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
   r = @r_icd_fs.find({icd_code: icd_code, icd_fs_bing_de: {"$exists" => true}},
                   fields: [:icd_fs_bing_de,:fs_code],
                   sort: {icd_fs_bing_de: 'descending'}).limit(count).to_a
   #puts "found #{r.size} fields by bing rank"
   return r
  end

  # @return The drgs (most common diagnoses) for a given icd
  def get_drgs(icd_code)
    doc = @icd[:de].find_one({code: icd_code})
    doc['drgs']
  end

  # @return The raw icd database entry for the given code.
  def get_icd(icd_code, language)
    @icd[language.to_sym].find_one({code: icd_code})
  end

  # @return An array of all fs codes related to a given mdc. 
  # Used for icd > drg > mdc > fs mapping.
  def get_fs_code(mcd_code)
    documents = @r_mdc_fs.find({mdc_code: mcd_code.to_s})
    fmhs = []
    documents.each do |document|
      fmhs << document['fs_code']
    end
    fmhs
  end

  # All entries in relationFSZuICD that specify that the mapping was done manually.
  # For a given icd.
  def get_manually_mapped_fs_codes_for_icd(icd_code)
    documents = @r_icd_fs.find({icd_code: icd_code, manually: 1})
    fs = []
    documents.each do |document|
      fs << document['fs_code']
    end

    fs
  end

  # @return An array of available thesaurName s
  def get_available_thesaur_names()
    a = @client['thesauren'].collection_names
    a.delete('thesaurusToFSCode')
    a.delete('thesaurusToFSCode2')
    a.delete('system.indexes')
    return a
  end

  # @return A hash fs_code (Integer) to fs_name (localised to lang)
  def get_fs_names(lang)
    fs = {}
    @fs.find().each { |b| 
      fs[Integer(b["code"])] = 
        b[lang].encode("UTF-8")
    }
    fs
  end

  # @param thesaurName any of the names returned by get_available_thesaur_names()
  # @return true if the given icd code is listed in the thesaur
  def is_icd_code_in_thesaur_named?(icd_code, thesaurName)
    return @client['thesauren'][thesaurName].find_one({icd_code: icd_code}) != nil
  end

  # All fs codes related to the given thesaur.
  def get_fs_codes_for_thesaur_named(thesaurName)
      a = @client['thesauren']['thesaurusToFSCode2'].find(
          { thesaurName: thesaurName}, fields: {:fs_code => 1, :_id => 0})
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
