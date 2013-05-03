require_relative 'dictionary_parser'

class DictionaryParserRunscript
  def self.run (adapter, file)
    puts "parsing dictionary at #{file}"
    parser = DictionaryParser.new(file)
    docs = parser.parse_ranges

    puts "connecting to database..."
    write_adapter = adapter

    puts "updating the collection..."
    docs.each do |doc|
      old = doc.clone
      old.delete('exklusiva')
      old.delete('fmhcodes')
      doc['updated'] = true
      write_adapter.update_doc(old, doc)
    end

    #handling deletions
    del_count = write_adapter.check_deletions.count()
    if del_count>0
      puts "There have been the following deletions in the input file (#{file}):"
      write_adapter.check_deletions.each do |deleted|
        deleted.delete('_id')
        puts deleted
      end
      puts "Do you want to delete them from the database? (y/N)"
      if STDIN.gets.chomp == 'y'
        write_adapter.check_deletions.each do |deleted|
          write_adapter.delete(deleted)
        end
        puts "deleted #{del_count} entries"
      else
        puts "skipped deletions"
      end
    end
    #remove a status field in the collection
    puts "cleaning up..."
    write_adapter.remove_updated
  end


end




