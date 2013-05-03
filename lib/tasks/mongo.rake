# this file is used when running the 'db' rake tasks. 'prepare' has to be empty for mongo-databases.
require Rails.root.join('db', 'seed')

namespace :db do
  namespace :test do
    task :prepare do
      # Stub out for MongoDB
    end
  end
  
  task :seed do
    #env = Rails.env || "defaults"    this chooses development, which tries to find localhost
    env = "defaults"
    seeder = Seed.run(env)
  end
end
