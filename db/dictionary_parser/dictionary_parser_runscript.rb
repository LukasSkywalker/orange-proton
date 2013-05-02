require_relative 'dictionary_parser'

class DictionaryParserRunscript
  def self.run (adapter, file)
    puts "parsing"
    parser = DictionaryParser.new(file)
    docs = parser.parse_ranges
    puts "connecting..."
    write_adapter = adapter
    puts "updating"
    docs.each do |doc|
      old = doc.clone
      old.delete('exklusiva')
      old.delete('fmhcodes')
      write_adapter.update_doc(old, new)
    end
  end


end




