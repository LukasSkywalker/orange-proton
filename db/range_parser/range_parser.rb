class RangeParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_ranges
    docs = []
    file.each_line() do |line|
      splits = line.split(';')
      level  = splits[0].to_i
      beginning = splits[1]
      ending = splits[2]
      name = splits[3]
      fmhcodes = []
      for i in 4..splits.length-1 do
        splits[i].gsub(/\s+/, "")
        fmhcodes<<splits[i].to_i unless splits[i] == '' or splits[i] == "\n"
      end
      docs<<{'level' => level, 'beginning' => beginning, 'ending' => ending, 'name' => name, 'fmhcodes' =>fmhcodes}
    end
    docs
  end
end