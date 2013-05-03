require_relative 'chop_drg_parser'


class ChopDrgParserRunscript
  def self.run (adapter, file)

    puts "connecting to database..."
    parser = ChopDrgParser.new(file)
    write_adapter = adapter
    chop_entries = write_adapter.get_docs

    chop_entries.each do |doc|
      doc.delete('_id')
      doc['drgs'] = []
    end
    puts "parsing file and connecting to CHOPs..."
    chop_drg_assocs = parser.read_assocs
    results = []
    i=0
    progress = '.'
    chop_drg_assocs.each do |assoc|
      #progress output
      STDOUT.print "                                 \r"
      progress << '.' if i%10 == 0
      progress = '.' if progress.length >20
      STDOUT.print "#{i*100/chop_drg_assocs.size}% #{progress} \r"


      found_entries = chop_entries.select{|entry|
        entry['code'].eql? assoc['chop']
      }
      unless found_entries[0].nil?
        found_entries[0]['drgs']<<assoc['drg']
      end
      i = i+1
    end
    puts 'updating collection...'
    chop_entries.each do |entry|
      old = entry.clone
      old.delete('drgs')
      write_adapter.update_doc(old, entry)
    end
    puts 'cleaning up...'
    write_adapter.remove_updated
  end

end



