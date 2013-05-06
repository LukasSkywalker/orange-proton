class ChopParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_chops

    docs = []
    file.each_line() do |line|
      unless line == ""
        synonyms = []
        splits = line.split(';')
        code  = splits[0].strip
        text = splits[1].strip
        for i in 2..splits.length-1 do
          splits[i].strip! unless splits[i].nil?
          synonyms << splits[i] unless splits[i] == '' or splits[i] == "\n"
        end

        docs<<{'code' => code, 'text' => text, 'synonyms' =>synonyms}
      end
    end
    docs
  end
end