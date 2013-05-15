# this file is used when running the 'db' rake tasks. 'prepare' has to be empty for mongo-databases.
require Rails.root.join('db', 'seed')

namespace :db do
  namespace :test do
    task :prepare do
      # Stub out for MongoDB
    end
  end
  
  task :seed do
    env = Rails.env || "defaults"
    Seed.run(env)
  end

  #This updates everything apart from doctors and ICD/CHOP catalogs
  task :update_quick do
    env = Rails.env || "defaults"
    Seed.update_quick(env)
  end

  #This updates everything apart from doctors and ICD/CHOP catalogs
  task :update_docs do
    env = Rails.env || "defaults"
    Seed.update_docs(env)
  end
end
