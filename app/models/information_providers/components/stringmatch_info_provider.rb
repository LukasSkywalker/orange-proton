#encoding: utf-8

# This finds Fachgebiete related to an illness by comparing the (german) name of the 
# illness or any of it's synonyms and inclusiva to a list of keywords related to a fachgebiet.
# This is based on a manually created list of keywords and exclusiva.
class StringmatchInfoProvider < DatabaseInfoProvider
  
  def get_fields(icd_code, max_count, language)
    if self.db.get_icd_entry(icd_code, 'de').nil?    # all the keywords are in German
      raise ProviderLookupError.new('no_icd_chop_data', language)
    else
      entry = self.db.get_icd_entry(icd_code, 'de')
    end
    Rails.logger.info entry
    keywords = self.db.get_fachgebiete_keywords() 

    code_text = entry['text'].downcase # TODO Take synonyms and inclusiva into account (?)

    fs = []
    keywords.each do |document|
      fs_entry = get_fs(code_text, document, 1, language)
      unless fs_entry.nil?
        fs << fs_entry unless fs.include? fs_entry
      end
    end


    code_text=''
    synonyms = entry['synonyms']
    unless synonyms.nil?
      entry['synonyms'].each do |syn|
        code_text << syn.downcase
      end
    end

    keywords.each do |document|
      fs_entry = get_fs(code_text, document, 0.3, language)
      unless fs_entry.nil?
        fs << fs_entry if fs.select{|entry| entry.name == fs_entry.name}.empty?
      end
    end

    fs
  end

  def get_fs(code_text, document, relevance, language)
    fs_entry = nil
    if code_text.include? document['keyword'].downcase
      valid = true
      document['exklusiva'].each do |exkl|
        if code_text.include? exkl.downcase
          valid = false
        end
      end
      if valid
        document['fmhcodes'].each do |fs_code|
          fs_entry = fs_code_to_field_entry(fs_code.to_i, relevance, language)
        end
      end
    end
    fs_entry
  end
end
