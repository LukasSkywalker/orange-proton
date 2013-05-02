require_relative 'script_db_adapter'

class Seed
  def initialize (env)
    environment = env

    db_config = YAML.load_file('config/mongo.yml')[environment]
    db = db_config['collections']['doctors'][0]
    coll = db_config['collections']['doctors'][1]
    host = db_config['host']
    port = db_config['port']

    adapter = ScriptDBAdapter.new(db, coll , host, port, false)
    puts adapter.get_docs[0]
  end
end