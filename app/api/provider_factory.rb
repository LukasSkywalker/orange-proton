require_rel '../models/information_providers'

module ProviderFactory
  class << self
    def get
      case Rails.env
        when 'test'
          MockInfoProvider.new
        when 'development-remote', 'development'
          CompoundInfoProvider.new
        when 'production'
          CompoundInfoProvider.new
        else
          BaseInformationProvider.new
      end
    end
  end
end