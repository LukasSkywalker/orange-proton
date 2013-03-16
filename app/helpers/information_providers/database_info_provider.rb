PWD = File.dirname(__FILE__) unless
require PWD + '/../database_adapter'
require PWD + '/../../models/mongo_models/doctor'
require PWD + '/../../models/mongo_models/icd_entry'
require PWD + '/../../models/mongo_models/field'

class DatabaseInfoProvider <  BaseInformationProvider

  attr_accessor :db

  def initialize
    self.db = DatabaseAdapter.new
  end

  def get_doctors(field_code, lat, long, count)
    Doctor.first
  end

  def get_field_name(field_code, language)
    {
        name: Field.where(:code => field_code).first[language.to_sym]
    }
  end
end