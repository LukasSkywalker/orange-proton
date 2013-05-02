require_relative 'script_db_adapter'
require_relative 'dictionary_parser/dictionary_parser_runscript'



class Seed
  def self.run (env)
    environment = env

    db_config = YAML.load_file('config/mongo.yml')[environment]

    db = db_config['collections']['icd_keywords'][0]
    coll = db_config['collections']['icd_keywords'][1]
    host = db_config['host']
    port = db_config['port']
    admin_db = db_config['database']
    write_user = 'pse4_write'
    adapter = ScriptDBAdapter.new(db, coll , host, port, admin_db, false, write_user)


    DictionaryParserRunscript.run(adapter, "../csv_files/icd_keywords.csv")
  end
end