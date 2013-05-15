orange-proton
=============

## How to run
* Install Ruby 1.9.3 or similar
* Install the bundler gem: `gem install bundler`
* Install the gems defined in Gemfile `bundle install`
* Install the Node Javascript-runtime as described in [joyent/node](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint)
* Set up the database (follow the instructions in "README.txt" in the db folder.
* Run the server
  * in development mode (local DB) with `rails s -e development`
  * in development mode (remote DB) with `rails s -e development-remote`
  * in production mode (remote DB) with `rake assets:precompile` and `rails s -e production`

* For testing with the local DB: ` RAILS_ENV=test rake spec`

* View the in-code documentation with yard `gem install yard`, then `yard server --reload`.


## Todo when deploying
* When using an Apache or Nginx server, be sure to prevent the Rails server from serving static assets with setting `config.serve_static_assets` to false. When it's true, the Rails server will handle request to static assets in /public/assets, which is unnecessary overhead, since Apache/Nginx can serve those already-compiled files faster and without requiring the full rails stack.
* Add database spec which counts entries. This is uncommented in /spec/models/database_spec.rb

## Style conventions
* Use fence-case for naming css selectors (don't use camelCase or snake_case)
* Use camelCase for JavaScript
* Use snake_case for Ruby
