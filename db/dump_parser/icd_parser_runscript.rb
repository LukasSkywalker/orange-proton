require_relative 'json_parser'

class IcdParserRunscript
  def self.run (adapter, file)
    puts "parsing ICD catalog at #{file}"
    parser = JsonParser.new(file)
    docs = parser.parse_chops
    write_adapter = adapter
    i=0

    puts "-updating the collection..."
    docs.p_each(20) do |doc|
      #progress output
      STDOUT.print "                                 \r"
      STDOUT.print "-#{i*100/docs.size}% \r"
      i+=1

      old = doc.clone
      old.delete('text')
      old.delete('superclass')
      old.delete('inclusiva')
      old.delete('exklusiva')
      old.delete('notes')
      old.delete('coding hints')
      old.delete('modifier_link')
      old.delete('subclasses')
      old.delete('modifiers')
      old.delete('synonyms')
      old.delete('drgs')
      old.delete('updated')

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




