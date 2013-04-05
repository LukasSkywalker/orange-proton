# This basically duplicates the api/api.rb, but does some extra work and
# knows about the internals of the models (additional layer of abstraction).
module InformationInterface
  # promote this module to a class to make it have an attribute (?)
  class << self
    attr_accessor :provider
  end

  # Handle queries
  # /api/v1/fields/get?code=string&count=integer&lang=string

  # The info provider used to generate this data
  self.provider = CompoundInfoProvider.new
  module IcdData
    def get_fields(code, max_count, lang)
      f = InformationInterface.provider.get_fields(code, max_count, lang)

      #  If there were no results, look up at superclass (e.g. B26.9 -> B26)
      if f[:fields].size == 0 && InformationInterface.provider.is_icd_subclass(code)

        f[:fields] = InformationInterface.provider.get_fields(
          InformationInterface.provider.to_icd_superclass(code), 
          max_count, lang)[:fields]
      end

      # Sort results by relatedness
      f[:fields].sort! {
        |x,y| 
        # Do not use return in a block!
        y[:relatedness] - x[:relatedness]
      }

      # And limit to requested amount
      # TODO Make the compound information provider do the sorting and limitng?
      f[:fields] = f[:fields][0..max_count-1]

      return f
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
      InformationInterface.provider.get_field_name(field_code, lang)
    end
  end

  # /api/v1/admin/set??? (values?)
  # TODO Document!
  module Admin
    def set_relatedness(values)
      values = values.gsub('[','').gsub(']','')
      vals = values.split(',')
      # See compound info provider (only info provider implementing this).
      InformationInterface.provider.set_relatedness_weight vals
    end
  end
end
