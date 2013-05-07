require_relative 'script_db_adapter'
require_relative 'dictionary_parser/dictionary_parser_runscript'
require_relative 'dump_parser/chop_parser_runscript'
require_relative 'dump_parser/icd_parser_runscript'
require_relative 'chop_drg_parser/chop_drg_parser_runscript'
require_relative 'doctor_parser/doc_parser_runscript'
require_relative 'fmh_names_parser/fmh_names_parser_runscript'



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


=begin
    #Insert/Update icd dictionary
    adapter.set_collection(db_config['collections']['icd_keywords'][0],db_config['collections']['icd_keywords'][1])
    DictionaryParserRunscript.run(adapter, "../csv_files/icd_keywords.csv")

    #Insert/Update chop dictionary
    adapter.set_collection(db_config['collections']['chop_keywords'][0],db_config['collections']['chop_keywords'][1])
    DictionaryParserRunscript.run(adapter, "../csv_files/chop_keywords.csv")

    #Insert/Update CHOP catalog 2012 de
    adapter.set_collection("testchop12","de")
    ChopParserRunscript.run(adapter, "../dumps/chop_2012_ch_de.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2012 fr
    adapter.set_collection("testchop12","fr")
    ChopParserRunscript.run(adapter, "../dumps/chop_2012_ch_fr.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 de
    adapter.set_collection("testchop13","de")
    ChopParserRunscript.run(adapter, "../dumps/chop_2013_ch_de.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 fr
    adapter.set_collection("testchop13","fr")
    ChopParserRunscript.run(adapter, "../dumps/chop_2013_ch_fr.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 it
    adapter.set_collection("testchop13","it")
    ChopParserRunscript.run(adapter, "../dumps/chop_2013_ch_it.json")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update ICD catalog 2012 de
    adapter.set_collection("testicd12","de")
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_ch_de.json")

    #Insert/Update ICD catalog 2012 fr
    adapter.set_collection("testicd12","fr")
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_ch_fr.json")

    #Insert/Update ICD catalog 2012 it
    adapter.set_collection("testicd12","it")
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_ch_it.json")

    #Insert/Update ICD catalog 2012 en
    adapter.set_collection("testicd12","en")
    IcdParserRunscript.run(adapter, "../dumps/icd_2012_us_en.json")

    #Insert/Update ICD catalog 2010 de
    adapter.set_collection("testicd10","de")
    IcdParserRunscript.run(adapter, "../dumps/icd_2010_ch_de.json")

    #Insert/Update ICD catalog 2010 fr
    adapter.set_collection("testicd10","fr")
    IcdParserRunscript.run(adapter, "../dumps/icd_2010_ch_fr.json")

    adapter.set_collection('testdocs','doctors')
    DocParserRunscript.run(adapter, "../csv_files/doctors.csv")
=end
    adapter.set_collection('testfmh','fmh_names')
    FmhNamesParserRunscript.run(adapter, "../csv_files/fmh_names.csv")

  end
end