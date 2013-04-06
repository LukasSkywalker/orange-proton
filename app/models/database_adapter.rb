# This class connects to the real database and retrieves requested basic information. 
# We do not compute compound information here -- the information providers use
# the data they get from here to do this.
class DatabaseAdapter
  def initialize

    # Create a connection to the db based on the config/mongo.yml login data
    host = MongoMapper.connection.host
    port = MongoMapper.connection.port
    db_config = YAML::load(File.read(File.join(Rails.root, '/config/mongo.yml')))

    MongoMapper.connection = 
      Mongo::MongoClient.new(host, port, :pool_size => 20, :pool_timeout => 10)
    MongoMapper.database = 'admin'
    if db_config[Rails.env]
      mongo = db_config[Rails.env]
      if mongo['username'] && mongo['password']
        MongoMapper.database.authenticate(mongo['username'], mongo['password'])
      end
    end
    @client = MongoMapper.connection

    # Store some of the databases in variables so we don't need to redo this over and over
    @icd = {
        :de => @client['icd_2012_ch']['de'],
        :fr => @client['icd_2012_ch']['fr'],
        :it => @client['icd_2012_ch']['it'],
        :en => @client['icd_2012_ch']['en']
    }

    @chop = {
        :de => @client['chop_2013_ch']['de'],
        :fr => @client['chop_2013_ch']['fr'],
        :it => @client['chop_2013_ch']['it'],
        :en => @client['chop_2013_ch']['de'] # hardwired fallback
    }

    @fs = @client['fachgebieteUndSpezialisierungen']['fachgebieteUndSpezialisierungen']

    @r_icd_fs = @client['relationFSZuICD']['relationFSZuICD']
    @r_mdc_fs = @client['mdc']['mdcCodeToFSCode']
  end

  # @return At most count fields related to a specified icd_code sorted by Bing search results count.
  def get_fields_by_bing_rank(icd_code, count)
    @r_icd_fs.find({icd_code: icd_code, icd_fs_bing_de: {'$exists' => true}},
                   fields: [:icd_fs_bing_de,:fs_code],
                   sort: {icd_fs_bing_de: 'descending'}).limit(count).to_a
  end

  # @return The drgs (most common diagnoses) for a given ICD.
  def get_drgs_for_icd(icd_code)
    doc = @icd[:de].find_one({code: icd_code})
    doc.nil? ? [] : doc['drgs']
  end

  # @return The drgs (most common diagnoses) for a given chop.
  def get_drgs_for_chop(code)
    doc = @chop[:de].find_one({code: code})
    doc.nil? ? [] : doc['drgs']
  end

  # @return The raw icd database entry for the given ICD code.
  def get_icd_entry(icd_code, language)
    @icd[language.to_sym].find_one({code: icd_code})
  end

  # @return The raw chop database entry for the given chop code.
  def get_chop_entry(code, language)
    @chop[language.to_sym].find_one({code: code})
  end

  # @return An array of all fs codes related to a given MDC (Major diagnostic category). 
  # Used for icd > drg > mdc > fs mapping.
  # This is based on a manually set up table.
  def get_fs_code_by_mdc(mcd_code)
    documents = @r_mdc_fs.find({mdc_code: mcd_code.to_s})
    fmhs = []
    documents.each do |document|
      fmhs << document['fs_code']
    end
    fmhs
  end

  # @return All FS codes manually mapped to this icd code.
  def get_manually_mapped_fs_codes_for_icd(icd_code)
    documents = @r_icd_fs.find({icd_code: icd_code, manually: 1})
    fs = []
    documents.each do |document|
      fs << document['fs_code']
    end

    fs
  end

  # @return An array of available thesaur_name s
  def get_available_thesaur_names
    a = @client['thesauren'].collection_names
    a.delete('thesaurusToFSCode')
    a.delete('thesaurusToFSCode2')
    a.delete('system.indexes')
    a
  end

  # @return A hash fs_code (Integer) to fs_name (localised to lang)
  def get_fs_names(lang)
    fs = {}
    @fs.find().each { |b| 
      fs[Integer(b['code'])] =
        b[lang].encode('UTF-8')
    }
    fs
  end

  # @param thesaur_name any of the names returned by get_available_thesaur_names()
  # @return true if the given icd code is listed in the thesaur
  def is_icd_code_in_thesaur_named?(icd_code, thesaur_name)
    @client['thesauren'][thesaur_name].find_one({icd_code: icd_code}) != nil
  end

  # All fs codes related to the given thesaur.
  def get_fs_codes_for_thesaur_named(thesaur_name)
      a = @client['thesauren']['thesaurusToFSCode2'].find(
          { thesaurName: thesaur_name}, fields: {:fs_code => 1, :_id => 0})
      fs_codes= []
      a.each {|fs|
          fs_codes << fs['fs_code']
      }
      fs_codes
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

  # @return All "docfields" that are mapped to the fs_code (there are more fs_codes than docfields).
  # This is based on a manually set up table.
  # This is used by get_doctors_by_fs.
  def get_specialities_from_fs(fs_code)
    specs = @client['doctors']['docfieldToFSCode'].find({fs_code: fs_code})
    specialities = []
    specs.each do |spec|
      specialities << spec['docfield']
    end
    specialities
  end

  # @return All doctors (the raw db entry) with speciality in a given field (given as fs_code).
  def get_doctors_by_fs(fs_code)
    specs = get_specialities_from_fs fs_code

    docs = @client['doctors']['doctors'].
      find({'docfield' => {'$in' => specs} },{:fields => {'_id' => 0}})

    docs.to_a
  end

  # @return At most max_count fields related to the icd_code specified, sorted
  # by character sequence match length between the german illness name and the 
  # field name.
  def get_fields_by_char_match(icd_code, max_count)
    @r_icd_fs.find({icd_code: icd_code, by_seq_match: {'$exists' => true}},
                       fields: [:by_seq_match,:fs_code],
                       sort: {by_seq_match: 'descending'}).limit(max_count).to_a
  end

  # @return An array of all ICD Code ranges (as specified by the who) a given ICD code lies within.
  # Every range contains an array 'fmhcodes' of codes related to it.
  # This is based on a manually set up table.
  def get_ranges (icd)
    db = @client['ICDRangeFSH']
    col = db['mappings']
    ranges = []
    col.find().each do |doc|
      if ((doc['beginning']<=> icd) <=0) and ((doc['ending']<=> icd) >=0)
        doc.delete('name')
        ranges<<doc
      end
    end
    ranges
  end
end
