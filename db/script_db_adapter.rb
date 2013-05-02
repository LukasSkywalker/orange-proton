require 'mongo'
require 'parallel_each'
include Mongo

class ScriptDBAdapter
  attr_accessor :mongo_client, :db, :coll, :write
  def initialize (db , collection ,host, port, write, write_pw = '')
    mongo_client = MongoClient.new(host, port)
    self.write = write
    if write
      puts 'Enter your PW for the account pse4_write: '
      mongo_client.db('admin').authenticate('pse4_write',write_pw)
    else
      mongo_client.db('admin').authenticate('pse4_read','plokij')
    end
    db = mongo_client.db(db)
    self.coll = db.collection(collection)
  end

  def drop_collection
    self.coll.remove()
  end

  def get_docs
    self.coll.find().to_a
  end

  def insert(doc)
    return :no_permission unless self.write
    self.coll.insert(doc)
  end

end

