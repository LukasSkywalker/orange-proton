require 'json'

class DoctorParser
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
      if parts.size == 10
        doc['name'] = parts[0].strip
        doc['title'] = parts[1].strip
        doc['address'] = parts[2].strip
        doc['email'] = parts[3].strip
        doc['phone1'] = parts[4].strip
        doc['phone2'] = parts[5].strip
        doc['canton'] = parts[6].strip
        doc['docfield'] = parts[7].strip
        doc['long'] = parts[8].strip.to_f
        doc['lat'] = parts[9].strip.to_f
        docs<<doc
      end
    end
    docs
  end
end