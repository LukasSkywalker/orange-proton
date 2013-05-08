class FmhFallbackParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_docs
    docs = []
    file.each_line() do |line|
      splits = line.split(';')
      from  = splits[0].to_i
      to = splits[1].to_i

      docs<<{'from_fs' => from, 'to_fs' => to}
    end
    docs
  end
end