require_relative '../doctor_locator'

class DatabaseInfoProvider <  BaseInformationProvider

  attr_accessor :db

  def initialize
    self.db = DatabaseAdapter.new
  end

  def get_doctors(field_code, lat, long, count)
    DoctorLocator.new.find_doctors_within(field_code, lat, long, count)
  end

  # Handle
  # /api/v1/codenames/get?code=string&lang=string
  def get_field_name(field_code, language)
    {
        name: db.get_fs_name(field_code,language)
    }
  end
end
