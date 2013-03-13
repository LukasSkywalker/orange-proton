require_relative 'information_provider'

module InformationInterface
  module Doctors
    def get_close_doctors(field_code, lat, long, count)
      MockInfoProvider.new.get_doctors(field_code, lat, long, count)
    end
  end

  module IcdData
    def get_icd_data(field_code, lang)
      MockInfoProvider.new.get_icd_data(field_code, lang)
    end

    def get_fields_of_specialization(field_code, max_count, lang)
      MockInfoProvider.new.get_fields(field_code, max_count, lang)
    end
  end

  module Helpers
    def get_name_of_field(field_code, lang)
      MockInfoProvider.new.get_field_name(field_code, lang)
    end
  end
end