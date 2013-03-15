# encoding: utf-8

RAILS_ROOT = File.join( File.dirname(__FILE__), ".." )
God.load File.join( File.dirname(__FILE__), "restart_rule.rb" )

God.watch do |w|
  w.name = "rails-server"
  w.dir = RAILS_ROOT
  w.pid_file = "#{RAILS_ROOT}/tmp/pids/server.pid"
  w.start = "rails s"
  # w.stop = "kill `cat #{RAILS_ROOT}/tmp/pids/server.pid`"
  w.keepalive

  # restart if Gemfile is touched
  w.transition(:up, :restart) do |on|
    on.condition(:restart_file_touched) do |c|
      c.interval = 5.seconds
      c.restart_file = File.join(RAILS_ROOT, 'Gemfile')
    end
  end
end
