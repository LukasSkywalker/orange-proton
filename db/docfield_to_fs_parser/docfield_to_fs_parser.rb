class DocfieldToFsParser
  attr_accessor :file

  def initialize (filename)
    self.file = File.open(File.dirname(__FILE__) + "/#{filename}")
  end

  #@return an array of parsed docfield - FS documents
  def parse_documents
    documents = Array.new
    file.each_line() do |row|
      columns = row.split(',')
      docfield = columns[1]
      for i in 3..columns.size
        unless columns[i].nil?
          fmh = columns[i].gsub(/\s+/, "")
          unless fmh.nil?
            if fmh.length>0
              documents.push(create_document(docfield,fmh))
            end
          end
        end
      end
    end
    documents
  end

  def create_document(mdc, fmh)
    doc = {:docfield=>mdc,:fs_code=>fmh.to_i}
    doc
  end

end

