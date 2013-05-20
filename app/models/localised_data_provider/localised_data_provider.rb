# This implements looking up raw db entries in a given catalog and language.
# It also defines fallbacks for languages which are not available
# in the database.
class LocalisedDataProvider

  # One level fallbacks. If any catalog is missing a language, it must have
  # a fallback defined here, otherwise you get assertion errors.
  # We don't need a fallback for french since we have all dbs in french.
  @@language_fallbacks = {
    'en' => 'de',
    'it' => 'fr'
  }

  def initialize
    @db = DatabaseAdapter.new
  end

  # @param code [String] The icd or chop code to search the data for.
  # @param language [String] "de", "en", "fr", "it"
  # @param catalog [String] The catalog used to resolve the code.
  # @return The raw chop/icd db entry for the given code in the given language.
  # @raise [ProviderLookupError, RuntimeError]
  def get_icd_or_chop_data(code, language, catalog)
    lang = language # cannot use language parameter because then changing it in an inner block as no effect

    assert_language(lang)
    raise ProviderLookupError.new('unknown_code_type', lang) if get_code_type(code) == :unknown

    # lang fallback
    if !@db.has_data_for_language_and_catalog?(lang, catalog)
      assert(@@language_fallbacks.has_key?(lang))
      old_language = lang
      lang = @@language_fallbacks[lang]
      assert(lang != old_language)
      assert_language(lang)
      # try again - confirmed working (try a chop code with en)
      raise ProviderLookupError.new('no_icd_chop_data', lang) unless @db.has_data_for_language_and_catalog?(lang, catalog)
    end

    data = @db.get_catalog_entry(code, lang, catalog)
    raise ProviderLookupError.new('no_icd_chop_data', lang) if data.nil?

    # return changed lang and data
    {:data => data, :language => lang}
  end

  # Localises all `name` fields of each FieldEntry.
  # @param api_fields_array [Array] An array of {FieldEntry}s.
  # @param language [String] "de", "en", "fr", "it"
  # @raise [RuntimeError]
  def localise_field_entries(api_fields_array, language)
    assert_fields_array(api_fields_array)
    api_fields_array.each {|f|
      f.localise(@db, language)
    }
  end
end
