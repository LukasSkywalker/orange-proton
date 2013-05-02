require_relative 'dictionary_parser'

class DictionaryParserRunscript
  def self.run (adapter, file)
    puts "parsing dictionary at #{file}"
    parser = DictionaryParser.new(file)
    docs = parser.parse_ranges
    puts "connecting to database..."
    write_adapter = adapter
    puts "updating the collection"
    docs.each do |doc|
      old = doc.clone
      old.delete('exklusiva')
      old.delete('fmhcodes')
      write_adapter.update_doc(old, doc)
    end
  end


end




