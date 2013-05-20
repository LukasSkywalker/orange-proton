# This class enhances {FieldEntry}s to contain fallback fs_codes that will yield different sets of doctors.
# The fallbacks are chosen to be more general fields (a manually set up table) such that we find doctors closer to the user but less specific to the given fachgebiet.

class FallbackProvider
  attr_reader :db

  def initialize
    @db = DatabaseAdapter.new
  end

  # For all FieldEntries in the array finds all the fs_codes higher in the fallback hierarchy (a tree) than that entry's code which yield different docfields.
  # @param api_fields_array [Array] An array of {FieldEntry}s for which we are to search fallbacks.
  # @raise [RuntimeError]
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

      # Enforce this most general fallback to be always included.
      field.add_fallback(5) unless docfields.include? 'allgemeinaerzte' # 5 is allgemeine medizin
      Rails.logger.info field.fallbacks
    end

  end
end
