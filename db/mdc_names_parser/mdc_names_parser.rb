class MdcNamesParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_docs
    docs = []
    file.each_line() do |line|
      splits = line.split(';')
      num  = splits[0].to_i
      v = splits[1].strip
      code = splits[2].strip
      de = splits[3].strip
      fr = splits[4].strip
      it = splits[5].strip
      drgprefix = splits[6].strip

      docs<<{'num' => num, 'v' => v, 'code' => code, 'de' => de, 'fr' => fr, 'it' => it, 'drgprefix' => drgprefix}
    end
    docs
  end
end