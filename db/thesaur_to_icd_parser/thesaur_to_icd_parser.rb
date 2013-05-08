class ThesaurToIcdParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def parse_docs
    docs = []
    file.each_line() do |line|
      splits = line.split(';')
      thesaur  = splits[0]
      icds = []
      for i in 1..splits.length-1 do
        splits[i].gsub(/\s+/, "")
        splits[i].strip!
        icds<<splits[i] unless splits[i] == '' or splits[i] == "\n"
      end
      docs<<{'thesaur' => thesaur, 'icds' => icds}
    end
    docs
  end
end