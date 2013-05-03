require_relative 'script_db_adapter'
require_relative 'dictionary_parser/dictionary_parser_runscript'
require_relative 'chop_parser/chop_parser_runscript'
require_relative 'chop_drg_parser/chop_drg_parser_runscript'



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
    adapter.set_collection("test12","de")
    ChopParserRunscript.run(adapter, "../csv_files/chop_2012_ch_de.csv")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2012 fr
    adapter.set_collection("test12","fr")
    ChopParserRunscript.run(adapter, "../csv_files/chop_2012_ch_fr.csv")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 de
    adapter.set_collection("test13","de")
    ChopParserRunscript.run(adapter, "../csv_files/chop_2013_ch_de.csv")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 fr
    adapter.set_collection("test13","fr")
    ChopParserRunscript.run(adapter, "../csv_files/chop_2013_ch_fr.csv")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

    #Insert/Update CHOP catalog 2013 it
    adapter.set_collection("test13","it")
    ChopParserRunscript.run(adapter, "../csv_files/chop_2013_ch_it.csv")
    ChopDrgParserRunscript.run(adapter, "../csv_files/chop_to_drg_12_13.csv")

  end
end