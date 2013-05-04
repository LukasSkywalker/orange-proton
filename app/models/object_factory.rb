require_rel '.'
require_rel '../models/information_providers'

# Module of static methods, returning the Information retrieval objects used by the api.
module ObjectFactory

  class << self

    # @raise [RuntimeError]
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

    # @raise [RuntimeError]
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

    # @raise [RuntimeError]
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
