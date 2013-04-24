# TODO Do we need this to make sure rails loads our stuff before this?
require_rel '.'
require_rel '../models/information_providers'

module ObjectFactory
  # all static methods
  class << self

    def get_information_provider
      case Rails.env
        when 'test'
          MockInfoProvider.new
        when 'development-remote', 'development', 'production'
          CompoundInfoProvider.new
        else
          raise "No information provider for environment #{Rails.env}"
      end
    end

    def get_doctor_locator
      case Rails.env
        when 'test'
          MockDoctorLocator.new
        when 'development-remote', 'development', 'production'
          DoctorLocator.new
        else
          raise "No doctor locator for environment #{Rails.env}"
      end
    end

    def get_localised_data_provider
      case Rails.env
        when 'test'
          MockLocalisedDataProvider.new
        when 'development-remote', 'development', 'production'
          LocalisedDataProvider.new
        else
          raise "No localised data provider for environment #{Rails.env}"
      end
    end


  end
end
