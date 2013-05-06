class ChopDrgParser
  attr_accessor :file
  assocs = []
  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end
  def read_assocs
    assoc_hash = {}
    assoc_list = []
    file.each_line() do |line|
      splits = line.split(';')
      drg  = splits[0]
      chop = self.parse_chop(splits[1])
      #if assoc_hash[chop].nil?
      #  assoc_hash[chop] = []
      #end
      #assoc_hash[chop]<<drg
      assoc_list << {"drg" => drg , "chop" => chop}
    end
    assoc_list
  end
  def parse_chop (raw_chop)
    output= ''
    output += raw_chop[0]+raw_chop[1]
    i=2
    while i< raw_chop.length-2
      if i%2 == 0 and i != raw_chop.length-2
        output+='.'
      end
      output += raw_chop[i]
      i += 1
    end
    output
  end
end