class FallbackProvider


  attr_reader :db

  def initialize
    @db = DatabaseAdapter.new
  end

  def get_fallbacks(api_fields_array)
    assert_fields_array(api_fields_array)
    table = db.get_fmh_fallbacks_table



    api_fields_array.each{ |field|
      code = field.code
      docfields = db.get_specialities_from_fs(code)
      puts "====== fir cide"

      while true do
        puts code
        puts "has docfields "+docfields.to_s

        found = false
        table.each{ |entry|
          if entry["from_fs"] == code
            code = entry["to_fs"]
            found = true
            break
          end
        }
        break unless found
        tmpdocfields = db.get_specialities_from_fs(code)
        next if tmpdocfields.to_set == docfields.to_set
        field.add_fallback(code)
        puts "... and was added as fallback"
      end

      field.add_fallback(5) unless docfields.include? "allgemeinaerzte" # 5 is allgemeine medizin
    }

  end


end