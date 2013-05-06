# This class connects to the real database and retrieves requested basic information. 
# We do not compute compound information here -- the information providers use
# the data they get from here to do this.
#
# Note that we could cache all results indefinitely since the db doesn't change.
class DatabaseAdapter

  # Constructs this DatabaseAdapter by connecting to the db and setting up links to the tables.
  def initialize
    # Create a connection to the db based on the config/mongo.yml login data
    db_config = YAML.load_file(File.join(Rails.root, '/config/mongo.yml'))
    host = db_config[Rails.env]['host']
    port = db_config[Rails.env]['port']

    @client = Mongo::MongoClient.new(host, port, :pool_size => 20, :pool_timeout => 10)
    # Throws Mongo::AuthenticationError: Failed to authenticate user '...' on db 'admin' on failuse
    @client.db(db_config[Rails.env]['database']).authenticate(
        db_config[Rails.env]['username'],
        db_config[Rails.env]['password']
    )

    # Store the databases in variables so we don't need to access them by name

    # The catalogs
    @collections_config = db_config[Rails.env]['collections'] # This is defined in config/mongo.yml

    @catalogs = @collections_config['catalogs'] # The config specifies which
    @catalogs.keys.each do |catalog|
      @catalogs[catalog].keys.each do |key|
        @catalogs[catalog][key] = @client[@catalogs[catalog][key][0]][@catalogs[catalog][key][1]]
      end
    end

    # All the tables that are not catalog specific
    # We refer to fmh codes as fs codes as well (fachgebiet - spezialisierung codes)
    # These range from 2 - 210
    @fs = @client[@collections_config['fmh_codes'][0]][@collections_config['fmh_codes'][1]]

    @mdc_to_fs     = @client[@collections_config['mdc_to_fmh'][0]][@collections_config['mdc_to_fmh'][1]]
    @mdc           = @client[@collections_config['mdcs'][0]][@collections_config['mdcs'][1]]
    @icd_keywords  = @client[@collections_config['icd_keywords'][0]][@collections_config['icd_keywords'][1]]
    @chop_keywords = @client[@collections_config['chop_keywords'][0]][@collections_config['chop_keywords'][1]]

    @doctors     = @client[@collections_config['doctors'][0]][@collections_config['doctors'][1]]
    @compounds   = @client[@collections_config['compounds'][0]][@collections_config['compounds'][1]]
    @icd_ranges  = @client[@collections_config['icd_ranges'][0]][@collections_config['icd_ranges'][1]]
    @chop_ranges = @client[@collections_config['chop_ranges'][0]][@collections_config['chop_ranges'][1]]

    @fmh_fallbacks= @client[@collections_config['fmh_fallbacks'][0]][@collections_config['fmh_fallbacks'][1]]

    @docfield_to_fmh = @client[@collections_config['docfield_to_FMH_code'][0]][@collections_config['docfield_to_FMH_code'][1]]

    @thesaur_to_fs  = @client[@collections_config['thesaur_to_fs'][0]][@collections_config['thesaur_to_fs'][1]]
    @thesaur_to_icd = @client[@collections_config['thesaur_to_icd'][0]][@collections_config['thesaur_to_icd'][1]]
  end

  # @param catalog [String] A potential catalog name (e.g. 'icd_2012_ch')
  # Throws an exception if catalog isn't the name of a catalog in the db.
  # @note The catalog names are defined in the api's catalog regex and in config/mongo.yml
  def assert_catalog(catalog)
    raise "catalog #{catalog} does not exist " unless (@catalogs.has_key?(catalog))
  end

  # @return [Array] the fallback table - an array of ("from_fs": FSCode, "to_fs": FSCode) hashes.
  def get_fmh_fallbacks_table()
    @fmh_fallbacks.find().to_a
  end

  # @return True if the <catalog> database (must exist in some language) exists in <language>.
  def has_data_for_language_and_catalog?(language, catalog)
    assert_catalog(catalog)
    assert_language(language)

    @catalogs[catalog].has_key?(language)
  end

  # @param code [String] An ICD or CHOP code.
  # @param language [String] 'de', 'en', 'fr', 'it'
  # @param catalog [String] The catalog to look in.
  # @return [Hash] The raw icd database entry for the given ICD or CHOP code.
  #   nil if there's no entry for the given code
  def get_catalog_entry(code, language, catalog)
    assert_code(code)
    assert_language(language)
    assert_catalog(catalog)
    assert(has_data_for_language_and_catalog?(language, catalog))
    @catalogs[catalog][language].find_one({code: code})
  end

  # @param code [String] An ICD or CHOP code.
  # @param catalog [String] The catalog to look in.
  # @return [Array] An array of the drgs (most common diagnoses) for a given ICD/CHOP code.
  def get_drgs_for_code(code, catalog)
    assert_catalog(catalog)
    assert_code(code)
    doc = @catalogs[catalog]['de'].find_one({code: code})
    doc.nil? ? [] : doc['drgs']
  end

  # @return [Array] The icd dictionary
  #   (an array of Hashes with "keyword" => String, "exklusiva" => [String], "fmhcodes" => [Integer 2-210]).
  # @see In the database, under dictionaries/icd_dictionary
  def get_icd_keywords
    @icd_keywords.find().to_a
  end

  # @return [Array] The chop dictionary
  #   (an array of Hashes with "keyword" => String, "exklusiva" => [String], "fmhcodes" => [Integer 2-210]).
  # @see In the database, under dictionaries/chop_dictionary
  def get_chop_keywords
    @chop_keywords.find().to_a
  end

  # @return [Array] An array of all fs codes related to a given MDC (Major diagnostic category).
  #   An empty array if there are none or this is not an mdc_code.
  # @note Used for icd > drg > mdc > fs mapping. This is based on a manually set up table.
  def get_fs_code_by_mdc(mdc_code)
    documents = @mdc_to_fs.find({mdc_code: mdc_code.to_s})
    fmhs = []
    documents.each do |document|
      fmhs << document['fs_code']
    end
    fmhs
  end

  # @return [Array] An array of available thesaur_name s
  def get_available_thesaur_names
    names = []
    entries = @thesaur_to_icd.find()
    entries.each() do |entry|
      names<<entry['thesaur']
    end
    names
  end

  # @param language [String] 'de', 'en', 'fr', 'it'
  # @return [Hash] A hash fs_code (Integer) to fs_name (localised to language).
  def get_fs_names(language)
    assert_language(language)
    fs = {}
    @fs.find().each { |b| 
      fs[Integer(b['code'])] =
        b[language].encode('UTF-8')
    }
    fs
  end

  # @param thesaur_name any of the names returned by get_available_thesaur_names()
  # @return true if the given icd code is listed in the thesaur
  def is_icd_code_in_thesaur_named?(icd_code, thesaur_name)
    assert(get_available_thesaur_names().include?(thesaur_name))
    assert_icd_code(icd_code)
    @thesaur_to_icd.find_one({thesaur: thesaur_name})['icds'].include? icd_code
  end

  # @return [Array] An array of all fs codes associated to the given thesaur.
  # @param thesaur_name one of get_available_thesaur_names().
  def get_fs_codes_for_thesaur_named(thesaur_name)
    assert(get_available_thesaur_names().include?(thesaur_name))
    @thesaur_to_fs.find(
      { thesaurName: thesaur_name}, fields: {:fs_code => 1, :_id => 0}
    ).to_a.map {|fs| fs['fs_code'] }
  end

  # @return [String] The MDC Code (1-23) associated with the given DRG prefix (A-Z).
  #   nil if there is none or this is an invalid prefix.
  def get_mdc_code(drg_prefix)
    document=@mdc.find_one({drgprefix: drg_prefix})
    document.nil? ? nil : document['code']
  end

  # @param language [String] 'de', 'en', 'fr', 'it'
  # @return [String] The name of the Fachgebiet/Spezialisierung with the given code
  #   in the language specified. Throws an assertion error or returns
  #   nil if fs_code is not a valid code!
  def get_fs_name(fs_code, language)
    assert_language(language)
    assert_field_code(fs_code)
    document = @fs.find_one({code: fs_code.to_i})
    document.nil? ? nil : document[language]
  end

  # @return [Array] An array of all "docfields" that are mapped to the fs_code
  #   (there are more fs_codes than docfields). Throws an exception or is empty
  #   if fs_code is not a valid fs code!
  #   Might be empty if there are no matching specialities.
  # @note This is based on a manually set up table. This is used by get_doctors_by_fs.
  def get_specialities_from_fs(fs_code)
    assert_field_code(fs_code)
    @docfield_to_fmh.find(
      {fs_code: fs_code}
    ).to_a.map { |spec| spec['docfield'] }
  end

  # @return [Array] An array of all doctors (the raw db entry) with speciality in a
  #   given field (given as fs_code), possibly empty.
  def get_doctors_by_fs(fs_code)
    assert_field_code(fs_code)
    specs = get_specialities_from_fs fs_code
    docs = @doctors.find({'docfield' => {'$in' => specs} },{:fields => {'_id' => 0}})
    docs.nil? ? [] : docs.to_a
  end

  # @return [Array] The compound table (an array of Hashes
  #   "components" => [fs_code], => "result" => fs_code)
  # @note Used for merging two or more codes into one in CompoundInfoProvider. Based on a manually set up table.
  def get_compound_results_components
    d = @compounds.find()
    (d.nil?) ? [] : d.to_a
    #assert_field_code(d[0]['result']) if d.length > 0
    #assert_field_code(d[0]['components'][0]) if d.length > 0
  end

  # @return [Array] An array of all ICD Code ranges (a Hash for each range) (as specified by the WHO) a given
  #   ICD code lies within.
  #   Every range contains a field 'fmhcodes' which is an array of codes related to it.
  # @note This is based on a manually set up table.
  def get_icd_ranges (icd)
    assert_icd_code(icd)
    icd = icd[0] + icd[1] + icd[2] # only check the first three characters ('B26' not the .x part)
    ranges = []
    @icd_ranges.find().each do |doc|
      if ((doc['beginning']<=> icd) <=0) and ((doc['ending']<=> icd) >=0)
        doc.delete('name')
        ranges<<doc
      end
    end
    assert(ranges[0]['fmhcodes'])  if ranges.length > 0
    ranges
  end

  # @return [Array] An array of all CHOP Code ranges (as specified by the who) a given
  #   ICD code lies within.
  #   Every range contains an array 'fmhcodes' of codes related to it.
  # @note This is based on a manually set up table.
  def get_chop_ranges(chop)
    assert_chop_code(chop)
    chop = chop[0] + chop[1] # only compare the first two digits
    ranges = []
    @chop_ranges.find().each do |doc|
      if ((doc['beginning']<=> chop) <=0) and ((doc['ending']<=> chop) >=0)
        ranges<<doc
      end
    end
    assert(ranges[0]['fmhcodes'])  if ranges.length > 0
    ranges
  end
end
