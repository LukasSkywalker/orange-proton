require '../database_adapter'
require '../../models/mongo_models/doctor'
require '../../models/mongo_models/icd_entry'
require '../../models/mongo_models/field'

# Information Provider for live realworld data, originating from real database
class LiveInfoProvider < BaseInformationProvider
  def get_fields(field_code, max_count, language)
    raise NotImplementedError
  end

  def get_doctors(field_code, lat, long, count)
    raise NotImplementedError
  end

  def get_field_name(field_code, language)
    raise NotImplementedError
    end
end