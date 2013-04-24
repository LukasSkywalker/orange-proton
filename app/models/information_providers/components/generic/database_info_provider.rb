# Abstract base class for all information providers utilizing the db (which are basically all of them)
class DatabaseInfoProvider <  BaseInformationProvider
  def initialize
    @db = DatabaseAdapter.new
  end
end
