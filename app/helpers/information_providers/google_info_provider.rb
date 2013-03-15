PWD = File.dirname(__FILE__)
require PWD + '/../database_adapter'
require PWD + '/../../models/mongo_models/doctor'
require PWD + '/../../models/mongo_models/icd_entry'
require PWD + '/../../models/mongo_models/field'

# Information Provider for live realworld data, originating from real database
class GoogleInfoProvider < BaseInformationProvider

  attr_accessor :db

  def initialize
    self.db = DatabaseAdapter.new
  end

  def get_fields(icd_code, max_count, language)
    IcdEntry.set_language language
    {
        data: IcdEntry.where(:code => icd_code),
        fields: get_fields_of_specialization(icd_code, max_count, language),
        type: get_code_type(icd_code)
    }
  end

  def get_doctors(field_code, lat, long, count)
    Doctor.first
  end

  def get_field_name(field_code, language)
    {
        name: Field.where(:code => field_code).first[language.to_sym]
    }
  end

  def get_fields_of_specialization(icd_code, max_count, lang)
    out = []
    field_codes = self.db.get_fields_by_bing_rank(icd_code, max_count)
    field_codes.each do |fc|
      out << {
          name: Field.where(:code => fc['fs_code']).first[lang.to_sym],
          relatedness: fc['icd_fs_google_de'],
          field: fc['fs_code']
      }
    end
    out
  end
end
