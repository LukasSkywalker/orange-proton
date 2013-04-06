require_relative '../doctor_locator'

class DatabaseInfoProvider <  BaseInformationProvider

  attr_accessor :db, :locator

  def initialize
    self.db = DatabaseAdapter.new
    self.locator = DoctorLocator.new
  end

  def get_doctors(field_code, lat, long, count)
    self.locator.find_doctors_within(field_code, lat, long, count)
  end

  def get_icd_or_chop_data (code, language)
    self.get_code_type(code) == :icd ? self.db.get_icd_entry(code, language) : self.db.get_chop_entry(code, language)
  end

  def get_field_name(field_code, language)
    self.db.get_fs_name(field_code,language)
  end

  # @param field_codes [Array] an array of fs codes (2-210)
  # @return An array of field codes formatted as by API standard ({name : "...", relatedness: relatedness, field: code} for each code)
  def fs_codes_to_fields(field_codes, relatedness, lang)
    out = []
    field_codes.each do |fc|
      out << new_fs_field_entry(fc, relatedness, lang)
    end
    out
  end

  # same as above, but just for one code
  def new_fs_field_entry(fs_code, relatedness, lang)
    FieldEntry.new(self.db.get_fs_name(fs_code, lang),
                   relatedness,
                   fs_code
    )
  end
end
