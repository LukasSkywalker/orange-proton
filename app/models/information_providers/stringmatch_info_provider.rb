#encoding: utf-8

# This finds Fachgebiete related to an illness by comparing the (german) name of the 
# illness or any of it's synonyms and the name of the fachgebiet.
# We have precomputed this data and stored it in the db.
class StringmatchInfoProvider < DatabaseInfoProvider

  def initialize
    super
  end

  def get_fields(icd_code, max_count, language)
    entry = self.db.get_icd_entry(icd_code, "de") # all the keywords are in German so... 
    Rails.logger.info entry
    keywords = self.db.get_fachgebiete_keywords() 

    names = []
    names << entry['text']
    names.concat(entry['synonyms'])

    fs = []
    names.each do |name|
      Rails.logger.info "name '#{name}'..."
      keywords.each do |(keyword, fs_code)|
        Rails.logger.info "keyword '#{keyword}', code #{fs_code}"
        next unless name.include? keyword # keep case! we don't want "Hand" to match "Behandlung"
        Rails.logger.info "matches keyword #{keyword}"
        relatedness = 1 # TODO Increase if already there?

        fs << new_fs_field_entry(fs_code, relatedness, language)
      end
    end

    # TODO Remove duplicates

    normalize_relatedness(fs)
    return fs
  end

end
