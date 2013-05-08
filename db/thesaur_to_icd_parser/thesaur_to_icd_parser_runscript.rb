require_relative 'thesaur_to_icd_parser'

class ThesaurToIcdParserRunscript
  def self.run (adapter, file)
    puts "parsing thesauri at #{file}"
    parser = ThesaurToIcdParser.new(file)
    docs = parser.parse_docs
    write_adapter = adapter
    puts "-updating the collection..."

    i=0

    docs.p_each do |doc|
      #progress output
      STDOUT.print "                                 \r"
      STDOUT.print "-#{i*100/docs.size}%\r"
      i+=1

      old = doc.clone
      old.delete('icds')
      doc['updated'] = true
      write_adapter.update_doc(old, doc)
    end

    #handling deletions
    del_count = write_adapter.check_deletions.count()
    if del_count>0
      puts "-There have been the following deletions in the input file (#{file}):"
      write_adapter.check_deletions.each do |deleted|
        deleted.delete('_id')
        puts deleted
      end
      puts "Do you want to delete them (#{del_count}) from the database? (y/N)"
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




