require_relative 'information_provider'

module InformationInterface

  class << self
    attr_accessor :provider
  end

  self.provider = MockInfoProvider

  module Doctors
    def get_close_doctors(field_code, lat, long, count)
      InformationInterface.provider.get_doctors(field_code, lat, long, count)
    end
  end

  module IcdData
    def get_icd_data(field_code, lang)
      InformationInterface.provider.get_icd_data(field_code, lang)
    end

    def get_fields_of_specialization(field_code, max_count, lang)
      InformationInterface.provider.get_fields(field_code, max_count, lang)
    end
  end

  module Helpers
    def get_name_of_field(field_code, lang)
      InformationInterface.provider.get_field_name(field_code, lang)
    end
  end
end