require_relative 'chop_parser'

class ChopParserRunscript
  def self.run (adapter, file)
    puts "parsing CHOP catalog at #{file}"
    parser = ChopParser.new(file)
    docs = parser.parse_chops

    puts "connecting to database..."
    write_adapter = adapter
    i=0
    progress = '.'
    puts "updating the collection..."
    docs.p_each(20) do |doc|
      #progress output
      STDOUT.print "                                 \r"
      progress << '.' if i%10 == 0
      progress = '.' if progress.length >20
      STDOUT.print "#{i*100/docs.size}% #{progress} \r"
      i+=1

      old = doc.clone
      old.delete('text')
      old.delete('synonyms')
      doc['updated'] = true
      doc['drgs'] = []
      old.delete('drgs')
      old.delete('updated')
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
      puts "Do you want to delete them (#{del_count}) from the database? (y/N)"
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




