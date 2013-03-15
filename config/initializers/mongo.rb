=begin
MongoMapper.connection = Mongo::Connection.new(ENV['host'], ENV['port'])
MongoMapper.database = "#pse4-#{Rails.env}"
=end

db_config = YAML::load(File.read(File.join(Rails.root, '/config/mongo.yml')))

if db_config[Rails.env]
  mongo = db_config[Rails.env]
  MongoMapper.connection = Mongo::Connection.new(mongo['host'] || 'localhost',
                                                 mongo['port'] || 27017,
                                                 :logger => Rails.logger)
  MongoMapper.database = mongo['database']

  if mongo['username'] && mongo['password']
    MongoMapper.database.authenticate(mongo['username'], mongo['password'])
  end
end

if defined?(PhusionPassenger)
  PhusionPassenger.on_event(:starting_worker_process) do |forked|
    MongoMapper.connection.connect if forked
  end
end
