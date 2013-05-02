require_relative 'script_db_adapter'
require_relative 'dictionary_parser/dictionary_parser_runscript'



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
  end
end