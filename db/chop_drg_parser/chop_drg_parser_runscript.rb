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
      i = i+1
    end

  end

end



