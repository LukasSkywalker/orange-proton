
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
    lang = language # cannot use language parameter because then changing it in an inner block as no effect
    #(at least that's what the coloring in rubymine suggests...)
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

  def localise_field_entries(api_fields_array, language)
    assert_fields_array(api_fields_array)
    api_fields_array.each {|f|
      f.localise(@db, language)
    }
  end
end
