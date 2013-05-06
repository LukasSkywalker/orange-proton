require 'mongo'
require 'parallel_each'
include Mongo

class ScriptDBAdapter
  attr_accessor :mongo_client, :db, :coll, :write
  def initialize (db , collection ,host, port, admin_db, write, write_user = '', write_pw = '')
    self.mongo_client = MongoClient.new(host, port, :pool_size => 20, :pool_timeout => 60)
    self.write = write
    if write
      mongo_client.db(admin_db).authenticate(write_user,write_pw)
    else
      mongo_client.db(admin_db).authenticate('pse4_read','plokij')
    end
    self.coll = mongo_client[db][collection]

  end

  def set_collection (db_name, coll_name)
    self.coll = self.mongo_client[db_name][coll_name]
  end

  def drop_collection
    return :no_permission unless self.write
    self.coll.remove()
  end

  def delete (doc)
    return :no_permission unless self.write
    self.coll.remove(doc)
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
    self.coll.update(old, new, upsert: true )
  end

  def check_deletions
    self.coll.find({updated: nil})
  end

  def remove_updated
    size = self.coll.find().count()
    i=0
    self.coll.find().p_each do |doc|
      STDOUT.print "                                 \r"
      STDOUT.print "-#{i*100/size}%\r"

      doc.delete('updated')
      self.coll.update(doc,doc)
      i+=1
    end
  end

  def find_one(query)
    self.coll.find_one(query)
  end

end

