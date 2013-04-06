# This basically duplicates the api/api.rb, but does some extra work and
# knows about the internals of the models (additional layer of abstraction).
module InformationInterface

  mattr_accessor :provider
  self.provider = CompoundInfoProvider.new

  # Handle queries
  # /api/v1/fields/get?code=string&count=integer&lang=string
  module IcdChopData
    def get_fields(code, max_count, lang)
      fields = ApiFormatter.format_fields(InformationInterface.provider.get_fields(code, max_count, lang))
      icd_data = InformationInterface.provider.get_icd_or_chop_data(code, lang)
      type = InformationInterface.provider.get_code_type(code)

      ApiFormatter.format_response(icd_data, fields, type)
    end
  end

  # Handle
  # /api/v1/docs/get?long=float&lat=float&field=int&count=int
  module Doctors
    def get_doctors(field_code, lat, long, count)
      InformationInterface.provider.get_doctors(field_code, lat, long, count)
    end
  end

  # Handle
  # /api/v1/codenames/get?code=string&lang=string
  module Helpers
    def get_field_name(field_code, lang)
      field_name = InformationInterface.provider.get_field_name(field_code, lang)
      ApiFormatter.format_field_name field_name
    end
  end

  # /api/v1/admin/set??? (values?)
  # TODO Document!
  module Admin
    def set_relatedness(values)
      values = values.gsub('[','').gsub(']','')
      vals = values.split(',')
      vals.map! do |val|
        val.to_i / 100.0
      end
      # See compound info provider (only info provider implementing this).
      InformationInterface.provider.set_relatedness_weight vals
    end
  end
end
