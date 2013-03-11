ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

require 'simplecov-rcov'
SimpleCov.formatter = SimpleCov::Formatter::RcovFormatter

require 'simplecov'
SimpleCov.start

class ActiveSupport::TestCase
  # Fixtures are not supported with MongoDB. We could use gems like machinist
  # but we're probably better off by using factories like factory_girl
  # fixtures :all

  # Add more helper methods to be used by all tests here...
end
