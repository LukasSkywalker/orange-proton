require_relative 'chop_drg_parser'
require 'parallel_each'


class ChopDrgParserRunscript
  def self.run (adapter, file)

    parser = ChopDrgParser.new(file)
    write_adapter = adapter

    puts "parsing file at #{file} and connecting to CHOPs..."
    chop_drg_map = parser.read_assocs
    results = []
    i=0
    chop_entries = adapter.get_docs
    size = chop_entries.size
    chop_entries.p_each do |entry|
      #progress output
      STDOUT.print "                                 \r"
      STDOUT.print "-#{i*100/size}%\r"
      old = entry.clone
      old.delete('drgs')
      entry['drgs'] = chop_drg_map[entry['code']].nil? ? [] : chop_drg_map[entry['code']]
      adapter.update_doc(old,entry)


      #found_entry = adapter.find_one({code: entry['chop'].strip})
      #unless found_entry.nil?
      #  found_entry.delete('_id')
      #  old = found_entry.clone
      #  old.delete('drgs')
      #  found_entry['drgs']<<entry['drg']
      #  adapter.update_doc(old,found_entry)
      #end


      #found_entries = chop_entries.select{|entry|
      #  entry['code'].eql? assoc['chop']
      #}
      #unless found_entries[0].nil?
      #   found_entries[0]['drgs']<<assoc['drg']
      #end
      i = i+1
    end
    #puts 'updating collection...'

    #progress = ''
    #i=0
    #size = adapter.get_docs.size
    #chop_entries.p_each do |entry|
      #progress output
      #  STDOUT.print "                                 \r"
      #progress << '.' if i%10 == 0
      #progress = '.' if progress.length >20
      #STDOUT.print "#{i*100/size}% #{progress} \r"
      #i+=1

      #old = entry.clone
      #old.delete('drgs')
      #write_adapter.update_doc(old, entry)
      #end
  end

end



