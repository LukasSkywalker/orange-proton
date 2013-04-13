#encoding: utf-8

# This finds Fachgebiete related to an illness by comparing the (german) name of the 
# illness or any of it's synonyms and the name of the fachgebiet.
# We have precomputed this data and stored it in the db.
class StringmatchInfoProvider < DatabaseInfoProvider

  def initialize
    super
  end

  def get_fields(icd_code, max_count, language)
    entry = self.db.get_icd_entry(icd_code, 'de') # all the keywords are in German so...
    Rails.logger.info entry
    keywords = self.db.get_fachgebiete_keywords() 

    code_text = entry['text'].downcase

    fs = []

    keywords.each do |document|
      if code_text.include? document['keyword'].downcase
        valid = true
        document['exklusiva'].each do |exkl|
          if code_text.include? exkl.downcase
            valid = false
          end
        end
        if valid
          document['fmhcodes'].each do |fs_code|
            fs_entry = new_fs_field_entry(fs_code.to_i, 1, language)
            fs << fs_entry unless fs.include? fs_entry
          end
        end
      end
    end
    fs

  end


end
