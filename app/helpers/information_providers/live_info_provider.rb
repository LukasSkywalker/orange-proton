PWD = File.dirname(__FILE__)
require PWD + '/../database_adapter'
require PWD + '/../../models/mongo_models/doctor'
require PWD + '/../../models/mongo_models/icd_entry'
require PWD + '/../../models/mongo_models/field'

# Information Provider for live realworld data, originating from real database
class LiveInfoProvider < BaseInformationProvider
  def get_fields(code, max_count, language)
    IcdEntry.set_language language
    {
        :data => IcdEntry.where(:code => code),
        :fields => get_fields_of_specialization(code, max_count, language),
        :type => get_code_type(code)
    }
  end

  def get_doctors(field_code, lat, long, count)
    Doctor.first
  end

  def get_field_name(field_code, language)
    {
        :name => Field.where(:code => field_code).first[language.to_sym]
    }
  end

  def get_fields_of_specialization(field_code, max_count, lang)
    out = []
    Field.all[0..max_count-1].each do |f|
      out << {
          :name => f[lang.to_sym],
          :relatedness => 0.5,
          :field => f[:code]
      }
    end
    out
  end
end
