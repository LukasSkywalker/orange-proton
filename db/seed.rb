require_relative 'script_db_adapter'
require_relative 'dictionary_parser/dictionary_parser_runscript'
require_relative 'dump_parser/chop_parser_runscript'
require_relative 'dump_parser/icd_parser_runscript'
require_relative 'chop_drg_parser/chop_drg_parser_runscript'
require_relative 'doctor_parser/doc_parser_runscript'
require_relative 'fmh_names_parser/fmh_names_parser_runscript'
require_relative 'range_parser/range_parser_runscript'
require_relative 'compound_parser/compound_parser_runscript'
require_relative 'docfield_to_fs_parser/docfield_to_fs_parser_runscript'
require_relative 'thesaur_to_icd_parser/thesaur_to_icd_parser_runscript'
require_relative 'thesaur_to_fmh_parser/thesaur_to_fmh_parser_runscript'
require_relative 'mdc_to_fmh_parser/mdc_to_fmh_parser_runscript'
require_relative 'mdc_names_parser/mdc_names_parser_runscript'
require_relative 'fmh_fallback_parser/fmh_fallback_parser_runscript'



class Seed
  def self.run (env)
    environment = env

    db_config = YAML.load_file('config/mongo.yml')[environment]

    #initialize some values
    db = db_config['collections']['icd_keywords'][0]
    coll = db_config['collections']['icd_keywords'][1]
    host = db_config['host']
    port = db_config['port']
    admin_db = db_config['database']
    write_user = 'pse4_write'
    puts "Enter your PW for the account #{write_user}: "
    pw = STDIN.gets.chomp()
    adapter = ScriptDBAdapter.new(db, coll , host, port, admin_db, true, write_user, pw)

    #Insert/Update icd dictionary
    adapter.set_collection(db_config['collections']['icd_keywords'][0],db_config['collections']['icd_keywords'][1])
    DictionaryParserRunscript.run(adapter, "../csv_files/icd_keywords.csv")

    #Insert/Update chop dictionary
    adapter.set_collection(db_config['collections']['chop_keywords'][0],db_config['collections']['chop_keywords'][1])
    DictionaryParserRunscript.run(adapter, "../csv_files/chop_keywords.csv")

    #Insert/Update CHOP catalog 2012 de
    adapter.set_collection(db_config['collections']['catalogs']['chop_2012_ch']['de'][0],db_config['collections']['catalogs']['chop_2012_ch']['de'][1])
    ChopParserRunscript.run(adapter, "../dumps/chop_2012_ch_de.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2012 fr
    adapter.set_collection(db_config['collections']['catalogs']['chop_2012_ch']['fr'][0],db_config['collections']['catalogs']['chop_2012_ch']['fr'][1])
    ChopParserRunscript.run(adapter, "../dumps/chop_2012_ch_fr.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 de
    adapter.set_collection(db_config['collections']['catalogs']['chop_2013_ch']['de'][0],db_config['collections']['catalogs']['chop_2013_ch']['de'][1])
    ChopParserRunscript.run(adapter, "../dumps/chop_2013_ch_de.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 fr
    adapter.set_collection(db_config['collections']['catalogs']['chop_2013_ch']['fr'][0],db_config['collections']['catalogs']['chop_2013_ch']['fr'][1])
    ChopParserRunscript.run(adapter, "../dumps/chop_2013_ch_fr.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 it
    adapter.set_collection(db_config['collections']['catalogs']['chop_2013_ch']['it'][0],db_config['collections']['catalogs']['chop_2013_ch']['it'][1])
    ChopParserRunscript.run(adapter, "../dumps/chop_2013_ch_it.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update ICD catalog 2012 de
    adapter.set_collection(db_config['collections']['catalogs']['icd_2012_ch']['de'][0],db_config['collections']['catalogs']['icd_2012_ch']['de'][1])
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_ch_de.json")

    #Insert/Update ICD catalog 2012 fr
    adapter.set_collection(db_config['collections']['catalogs']['icd_2012_ch']['fr'][0],db_config['collections']['catalogs']['icd_2012_ch']['fr'][1])
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_ch_fr.json")

    #Insert/Update ICD catalog 2012 it
    adapter.set_collection(db_config['collections']['catalogs']['icd_2012_ch']['it'][0],db_config['collections']['catalogs']['icd_2012_ch']['it'][1])
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_ch_it.json")

    #Insert/Update ICD catalog 2012 en
    adapter.set_collection(db_config['collections']['catalogs']['icd_2012_ch']['en'][0],db_config['collections']['catalogs']['icd_2012_ch']['en'][1])
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_us_en.json")

    #Insert/Update ICD catalog 2010 de
    adapter.set_collection(db_config['collections']['catalogs']['icd_2010_ch']['de'][0],db_config['collections']['catalogs']['icd_2010_ch']['de'][1])
    IcdParserRunscript.run(adapter, "../dumps/icd_2010_ch_de.json")

    #Insert/Update ICD catalog 2010 fr
    adapter.set_collection(db_config['collections']['catalogs']['icd_2010_ch']['fr'][0],db_config['collections']['catalogs']['icd_2010_ch']['fr'][1])
    IcdParserRunscript.run(adapter, "../dumps/icd_2010_ch_fr.json")

    #Insert/Update doctors
    adapter.set_collection(db_config['collections']['doctors'][0],db_config['collections']['doctors'][1])
    DocParserRunscript.run(adapter, "../csv_files/doctors.csv")

    #Insert/Update doctors to fmh
    adapter.set_collection(db_config['collections']['docfield_to_FMH_code'][0],db_config['collections']['docfield_to_FMH_code'][1])
    DocfieldToFsParserRunscript.run(adapter, "../csv_files/docfield_to_fmh.csv")

    #Insert/Update FMH codes
    adapter.set_collection(db_config['collections']['fmh_codes'][0],db_config['collections']['fmh_codes'][1])
    FmhNamesParserRunscript.run(adapter, "../csv_files/fmh_names.csv")

    #Insert/Update ICD ranges
    adapter.set_collection(db_config['collections']['icd_ranges'][0],db_config['collections']['icd_ranges'][1])
    RangeParserRunscript.run(adapter, "../csv_files/icd_ranges.csv")

    #Insert/Update CHOP ranges
    adapter.set_collection(db_config['collections']['chop_ranges'][0],db_config['collections']['chop_ranges'][1])
    RangeParserRunscript.run(adapter, "../csv_files/chop_ranges.csv")

    #Insert/Update FMH compounds
    adapter.set_collection(db_config['collections']['compounds'][0],db_config['collections']['compounds'][1])
    CompoundParserRunscript.run(adapter, "../csv_files/fmh_compounds.csv")

    #Insert/Update thesaur to ICD
    adapter.set_collection(db_config['collections']['thesaur_to_icd'][0],db_config['collections']['thesaur_to_icd'][1])
    ThesaurToIcdParserRunscript.run(adapter, "../csv_files/thesaur_to_icd.csv")

    #Insert/Update thesaur to FMH
    adapter.set_collection(db_config['collections']['thesaur_to_fs'][0],db_config['collections']['thesaur_to_fs'][1])
    ThesaurToFmhParserRunscript.run(adapter, "../csv_files/thesaur_to_fmh.csv")

    #Insert/Update mdc to FMH
    adapter.set_collection(db_config['collections']['mdc_to_fmh'][0],db_config['collections']['mdc_to_fmh'][1])
    MdcToFmhParserRunscript.run(adapter, "../csv_files/mdc_to_fmh.csv")

    #Insert/Update mdc codes
    adapter.set_collection(db_config['collections']['mdcs'][0],db_config['collections']['mdcs'][1])
    MdcNamesParserRunscript.run(adapter, "../csv_files/mdc_names.csv")

    #Insert/Update fmh fallbacks
    adapter.set_collection(db_config['collections']['fmh_fallbacks'][0],db_config['collections']['fmh_fallbacks'][1])
    FmhFallbackParserRunscript.run(adapter, '../csv_files/fmh_fallbacks.csv')

  end


  #this does a quick update, skipping all ICD/CHOP catalogs and doctors
  def self.update_quick (env)
    environment = env

    db_config = YAML.load_file('config/mongo.yml')[environment]

    #initialize some values
    db = db_config['collections']['icd_keywords'][0]
    coll = db_config['collections']['icd_keywords'][1]
    host = db_config['host']
    port = db_config['port']
    admin_db = db_config['database']
    write_user = 'pse4_write'
    puts "Enter your PW for the account #{write_user}: "
    pw = STDIN.gets.chomp()
    adapter = ScriptDBAdapter.new(db, coll , host, port, admin_db, true, write_user, pw)

    #Insert/Update icd dictionary
    adapter.set_collection(db_config['collections']['icd_keywords'][0],db_config['collections']['icd_keywords'][1])
    DictionaryParserRunscript.run(adapter, "../csv_files/icd_keywords.csv")

    #Insert/Update chop dictionary
    adapter.set_collection(db_config['collections']['chop_keywords'][0],db_config['collections']['chop_keywords'][1])
    DictionaryParserRunscript.run(adapter, "../csv_files/chop_keywords.csv")

    #Insert/Update doctors to fmh
    adapter.set_collection(db_config['collections']['docfield_to_FMH_code'][0],db_config['collections']['docfield_to_FMH_code'][1])
    DocfieldToFsParserRunscript.run(adapter, "../csv_files/docfield_to_fmh.csv")

    #Insert/Update FMH codes
    adapter.set_collection(db_config['collections']['fmh_codes'][0],db_config['collections']['fmh_codes'][1])
    FmhNamesParserRunscript.run(adapter, "../csv_files/fmh_names.csv")

    #Insert/Update ICD ranges
    adapter.set_collection(db_config['collections']['icd_ranges'][0],db_config['collections']['icd_ranges'][1])
    RangeParserRunscript.run(adapter, "../csv_files/icd_ranges.csv")

    #Insert/Update CHOP ranges
    adapter.set_collection(db_config['collections']['chop_ranges'][0],db_config['collections']['chop_ranges'][1])
    RangeParserRunscript.run(adapter, "../csv_files/chop_ranges.csv")

    #Insert/Update FMH compounds
    adapter.set_collection(db_config['collections']['compounds'][0],db_config['collections']['compounds'][1])
    CompoundParserRunscript.run(adapter, "../csv_files/fmh_compounds.csv")

    #Insert/Update thesaur to ICD
    adapter.set_collection(db_config['collections']['thesaur_to_icd'][0],db_config['collections']['thesaur_to_icd'][1])
    ThesaurToIcdParserRunscript.run(adapter, "../csv_files/thesaur_to_icd.csv")

    #Insert/Update thesaur to FMH
    adapter.set_collection(db_config['collections']['thesaur_to_fs'][0],db_config['collections']['thesaur_to_fs'][1])
    ThesaurToFmhParserRunscript.run(adapter, "../csv_files/thesaur_to_fmh.csv")

    #Insert/Update mdc to FMH
    adapter.set_collection(db_config['collections']['mdc_to_fmh'][0],db_config['collections']['mdc_to_fmh'][1])
    MdcToFmhParserRunscript.run(adapter, "../csv_files/mdc_to_fmh.csv")

    #Insert/Update mdc codes
    adapter.set_collection(db_config['collections']['mdcs'][0],db_config['collections']['mdcs'][1])
    MdcNamesParserRunscript.run(adapter, "../csv_files/mdc_names.csv")

    #Insert/Update fmh fallbacks
    adapter.set_collection(db_config['collections']['fmh_fallbacks'][0],db_config['collections']['fmh_fallbacks'][1])
    FmhFallbackParserRunscript.run(adapter, '../csv_files/fmh_fallbacks.csv')
  end

  #this updates only the doctors
  def self.update_docs (env)
    environment = env

    db_config = YAML.load_file('config/mongo.yml')[environment]

    #initialize some values
    db = db_config['collections']['icd_keywords'][0]
    coll = db_config['collections']['icd_keywords'][1]
    host = db_config['host']
    port = db_config['port']
    admin_db = db_config['database']
    write_user = 'pse4_write'
    puts "Enter your PW for the account #{write_user}: "
    pw = STDIN.gets.chomp()
    adapter = ScriptDBAdapter.new(db, coll , host, port, admin_db, true, write_user, pw)

    #Insert/Update doctors
    adapter.set_collection(db_config['collections']['doctors'][0],db_config['collections']['doctors'][1])
    DocParserRunscript.run(adapter, "../csv_files/doctors.csv")

  end

end