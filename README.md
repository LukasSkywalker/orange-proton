orange-proton
=============

* Install Ruby 1.9.3 or similar
* Install the bundler gem: `gem install bundler`
* Install the gems defined in Gemfile `bundle install`
* Run the server with `rails s`

* If you want to automatically restart the server when it's down,
  * install god with `gem install god`
  * run it with `god -c orange-proton/config/god.rb`
