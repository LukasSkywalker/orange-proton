class CompoundParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_ranges
    docs = []

    file.each_line() do |line|
      components = []
      splits = line.split(';')
      result  = splits[0].to_i
      components << splits[1].strip.to_i
      components << splits[2].strip.to_i

      docs<<{'result' => result, 'components' => components}
    end
    docs
  end
end