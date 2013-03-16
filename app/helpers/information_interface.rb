require_relative 'information_providers/mock_provider'
require_relative 'information_providers/bing_info_provider'
require_relative 'information_providers/mdc_info_provider'

module InformationInterface

  class << self
    attr_accessor :provider
  end

  self.provider = MDCInfoProvider.new

  module Doctors
    def get_doctors(field_code, lat, long, count)
      InformationInterface.provider.get_doctors(field_code, lat, long, count)
    end
  end

  module IcdData
    def get_fields(code, max_count, lang)
      InformationInterface.provider.get_fields(code, max_count, lang)
    end
  end

  module Helpers
    def get_field_name(field_code, lang)
      InformationInterface.provider.get_field_name(field_code, lang)
    end
  end
end
