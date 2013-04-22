# This finds Fachgebiete related to an illness by comparing the (german) name of the 
# illness or any of it's synonyms and inclusiva to a list of keywords related to a fachgebiet.
# This is based on a manually created list of keywords and exclusiva.
class StringmatchInfoProvider < DatabaseInfoProvider
  
  def get_fields(icd_code, max_count, language)
    assert_language(language)
    assert_count(max_count)
    return [] unless get_code_type(icd_code) == :icd

    # all the keywords are in German, so we need the german entry
    entry = self.db.get_icd_entry(icd_code, 'de')
    Rails.logger.info entry
    raise ProviderLookupError.new('no_icd_chop_data', language) if entry.nil?

    keywords = self.db.get_fachgebiete_keywords() 

    fs = [] # array of fields (FieldEntry s)

    # Search for keywords in illness text (main name)
    code_text = entry['text'].downcase 
    keywords.each do |keyword_entry|
      fs.concat(get_fs(code_text, keyword_entry, 
                        1, # full relatedness for keywords in main name
                        language))
    end

    # Consolidate synonyms into one string
    code_text = ''
    synonyms = entry['synonyms']
    if !synonyms.nil?
      entry['synonyms'].each do |syn|
        code_text += syn.downcase
      end
    end

    # Search for keywords in synonym string
    keywords.each do |keyword_entry|
      fs.concat(get_fs(code_text, keyword_entry, 
                        0.3, # keywords matched in synonyms are just fallbacks
                        # TODO Couldn't we raise this a bit?
                        language))
    end
    
    # TODO Take inclusiva into account (?)
    fs = fold_duplicate_fields fs
    fs[0..max_count-1]
  end

  private
  # @return An array of the FieldEntries of the given keyword_entry
  # if code_text contains the keyword and none of the exclusiva 
  # otherwise the array is empty.
  def get_fs(code_text, keyword_entry, relatedness, language)
    return [] unless code_text.include? keyword_entry['keyword'].downcase

    keyword_entry['exklusiva'].each do |exkl|
      if code_text.include? exkl.downcase
        return [] # if the text matches an exclusiva of the keyword, no results
      end
    end

    return keyword_entry['fmhcodes'].map { |fs_code|
      fs_code_to_field_entry(fs_code.to_i, relatedness, language)
    }
  end
end
