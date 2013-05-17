class FallbackProvider
  attr_reader :db

  def initialize
    @db = DatabaseAdapter.new
  end

  def get_fallbacks(api_fields_array)
    assert_fields_array(api_fields_array)
    table = db.get_fmh_fallbacks_table

    api_fields_array.each do |field|

      code = field.code
      docfields = db.get_specialities_from_fs(code)
      Rails.logger.info "====== finding fallbacks for code #{code}"
      field.add_fallback(code) #always add what we already have (simplifies displaying)

      while true do # we keep looking for fallbacks and abort if we don't find any
        Rails.logger.info "...at code #{code}"
        Rails.logger.info 'currently covered docfields: '+docfields.to_s

        found = false
        table.each{ |entry|
          if entry['from_fs'] == code
            code = entry['to_fs']
            found = true
            break
          end
        }
        break unless found
        Rails.logger.info "found fallback #{code}"
        tmpdocfields = db.get_specialities_from_fs(code)
        Rails.logger.info 'with docfields '+tmpdocfields.to_s

        next if is_subset?(tmpdocfields, docfields)
        docfields.concat tmpdocfields
        docfields = docfields.to_set.to_a
        field.add_fallback(code)
        Rails.logger.info '... and was added as fallback'
      end

      field.add_fallback(5) unless docfields.include? 'allgemeinaerzte' # 5 is allgemeine medizin
      Rails.logger.info field.fallbacks
    end

  end
end