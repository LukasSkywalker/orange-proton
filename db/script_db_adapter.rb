require 'mongo'
require 'parallel_each'
include Mongo

class ScriptDBAdapter
  attr_accessor :mongo_client, :db, :coll, :write
  def initialize (db , collection ,host, port, admin_db, write, write_user = '', write_pw = '')
    mongo_client = MongoClient.new(host, port)
    self.write = write
    if write
      puts "Enter your PW for the account #{write_user}: "
      mongo_client.db(admin_db).authenticate(write_user,write_pw)
    else
      mongo_client.db(admin_db).authenticate('pse4_read','plokij')
    end
    db = mongo_client.db(db)
    self.coll = db.collection(collection)
  end

  def set_collection (db_name, coll_name)
    self.db = mongo_client.db(db_name)
    self.coll = db.collection(coll_name)
  end

  def drop_collection
    return :no_permission unless self.write
    self.coll.remove()
  end

  def get_docs(doc = {})
    self.coll.find(doc).to_a
  end

  def insert(doc)
    return :no_permission unless self.write
    self.coll.insert(doc)
  end

  def update_doc(old, new)
    return :no_permission unless self.write
    self.coll.update(old, new , { upsert: true })
  end

end

