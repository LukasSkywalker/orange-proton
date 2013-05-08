require 'json'

class FmhNamesParser
  attr_accessor :file
  assocs = []
  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  def read_docs
    docs = []
    self.file.each_line do |line|
      doc = {}
      parts = line.split(';')
      if parts.size == 6
        doc['code'] = parts[0].strip.to_i
        doc['de'] = parts[1].strip
        doc['en'] = parts[2].strip
        doc['fr'] = parts[3].strip
        doc['it'] = parts[4].strip
        docs<<doc
      end
    end
    docs
  end
end