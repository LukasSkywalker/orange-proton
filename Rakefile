#!/usr/bin/env rake
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.


require File.expand_path('../config/application', __FILE__)
require_relative 'db/seed'


namespace :db do
  task :seed do
    env = ENV['ENV'] || "defaults"
    seeder = Seed.run(env)
  end
end

OrangeProton::Application.load_tasks
