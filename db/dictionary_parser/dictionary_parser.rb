class DictionaryParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_dictionary

    docs = []
    file.each_line() do |line|
      exkl = []
      fmhcodes = []
      splits = line.split(',')
      keyword  = splits[0]
      for i in 1..2 do
        splits[i].gsub(/\s+/, "")
        exkl << splits[i] unless splits[i] == '' or splits[i] == "\n"
      end

      for i in 3..splits.length-1 do
        splits[i].gsub(/\s+/, "")

        fmhcodes<<splits[i].to_i unless splits[i] == '' or splits[i] == "\n"
      end
      docs<<{'keyword' => keyword, 'exklusiva' => exkl, 'fmhcodes' =>fmhcodes}
    end
    docs
  end
end