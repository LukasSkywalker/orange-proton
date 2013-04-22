require File.expand_path('../boot', __FILE__)

# don't use ActiveRecord
require "action_controller/railtie"
require "action_mailer/railtie"
require "active_resource/railtie"
require "rails/test_unit/railtie"
require "sprockets/railtie"

if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require(*Rails.groups(:assets => %w(development development-remote test)))
  # If you want your assets lazily compiled in production, use this line
  # Bundler.require(:default, :assets, Rails.env)
end

module OrangeProton
  class Application < Rails::Application

    # Load internal API files
    config.paths.add 'app/api', :glob => '**/*.rb'
    config.autoload_paths += Dir["#{Rails.root}/app/api/*"] # TODO doesn't this do the same as the line above?

    # Load models in subfolders of /models
    config.autoload_paths += Dir[ Rails.root.join('app', 'models', '**/') ]
   
    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password]

    # Enable escaping HTML in JSON.
    config.active_support.escape_html_entities_in_json = true
    
    # Enable the asset pipeline
    config.assets.enabled = true

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'

    # use the mongo_mapper when auto-generating models
    config.generators do |g|
      g.orm :mongo_mapper
    end
  end
end
