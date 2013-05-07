require_relative 'fmh_names_parser'
require 'parallel_each'


class FmhNamesParserRunscript
  def self.run (adapter, file)

    parser = FmhNamesParser.new(file)
    write_adapter = adapter

    puts "Parsing file at #{file}"
    docs = parser.read_docs
    results = []
    i=0
    size = docs.size

    puts '-updating collection...'
    docs.p_each do |entry|
      #progress output
      STDOUT.print "                                 \r"
      STDOUT.print "-#{i*100/size}%\r"

      old = entry.clone
      entry['updated'] = true
      adapter.update_doc(old,entry)
      i = i+1
    end

    #handling deletions
    del_count = write_adapter.check_deletions.count()
    if del_count>0
      puts "-There have been the following deletions in the input file (#{file}):"
      write_adapter.check_deletions.each do |deleted|
        deleted.delete('_id')
        puts deleted
      end
      puts "-Do you want to delete them (#{del_count}) from the database? (y/N)"
      if STDIN.gets.chomp == 'y'
        write_adapter.check_deletions.each do |deleted|
          write_adapter.delete(deleted)
        end
        puts "-deleted #{del_count} entries"
      else
        puts "-skipped deletions"
      end
    end
    #remove a status field in the collection
    puts "-cleaning up..."
    write_adapter.remove_updated
  end

end



