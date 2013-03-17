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
