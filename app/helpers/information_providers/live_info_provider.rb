PWD = File.dirname(__FILE__)
require PWD + '/../database_adapter'
require PWD + '/../../models/mongo_models/doctor'
require PWD + '/../../models/mongo_models/icd_entry'
require PWD + '/../../models/mongo_models/field'

# Information Provider for live realworld data, originating from real database
class LiveInfoProvider < BaseInformationProvider
  def get_fields(field_code, max_count, language)
    {
        :data => IcdEntry.first,
        :fields => Field.first,
        :type => get_code_type(field_code)
    }
  end

  def get_doctors(field_code, lat, long, count)
    Doctor.first
  end

  def get_field_name(field_code, language)
    {
        :name => 'Unknown'
    }
  end
end
