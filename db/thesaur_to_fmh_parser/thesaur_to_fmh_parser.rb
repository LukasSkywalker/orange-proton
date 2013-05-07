class ThesaurToFmhParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_docs
    docs = []
    file.each_line() do |line|
      splits = line.split(';')
      fmh  = splits[0].to_i
      thesaurname = splits[1].strip

      docs<<{'fs_code' => fmh, 'thesaurName' => thesaurname}
    end
    docs
  end
end