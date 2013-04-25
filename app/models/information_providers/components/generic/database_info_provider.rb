# Abstract base class for all information providers utilizing the db (which are basically all of them)
class DatabaseInfoProvider <  BaseInformationProvider
  attr_accessor :db
  def initialize
    self.db = DatabaseAdapter.new
  end
end
