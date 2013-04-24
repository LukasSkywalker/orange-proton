
class LocalisedDataProvider

  # one level fallbacks. If any catalog is missing a language, it must have
  # a fallback defined here, otherwise you get assertion errors.
  @@language_fallbacks = {
    "en" => "de",
    "it" => "fr"
  }

  def initialize
    @db = DatabaseAdapter.new
  end

  # Return the raw chop/icd db entry for the given code in the given language.
  # @throws ProviderLookupError s 
  def get_icd_or_chop_data (code, language, catalog)
    assert_language(language)

    raise ProviderLookupError.new('unknown_code_type', language) if get_code_type(code) == :unknown

    # Language fallback
    if !@db.has_data_for_language_and_catalog?(language, catalog)
      assert(@@language_fallbacks.has_key?(language))
      old_language = language
      language = @@language_fallbacks[language]
      assert(language != old_language)
      assert_language(language)
      # try again
      raise ProviderLookupError.new('no_icd_chop_data', language) if 
        @db.has_data_for_language_and_catalog?(language, catalog)
    end

    data = @db.get_catalog_entry(code, language, catalog)
    raise ProviderLookupError.new('no_icd_chop_data', language) if data.nil?

    # return changed language and data
    {:data => data, :language => language}
  end

  def localise_field_entries(api_fields_array, language)
    assert_fields_array(api_fields_array)
    api_fields_array.each {|f|
      f.localise(@db, language)
    }
  end
end
