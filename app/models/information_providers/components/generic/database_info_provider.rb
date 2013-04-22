# Abstract base class for all information providers utilizing the db (which are basically all of them)
class DatabaseInfoProvider <  BaseInformationProvider
  attr_reader :db

  def initialize
    @db = DatabaseAdapter.new
  end

  # Return the raw chop/icd db entry for the given code in the given language.
  # @throws ProviderLookupError s 
  def get_icd_or_chop_data (code, language)
    assert_language(language)
    type = get_code_type(code)
    case type
      when :icd
        data = self.db.get_icd_entry(code, language)

        # Drop codes not in german ICD table, fixes #176
        # We do this here since we want to keep the db as delivered (it might change)
        if self.db.get_icd_entry(code, 'de').nil?   # TODO Test
          data = nil
        end
      when :chop
        data = self.db.get_chop_entry(code, language)
      else
        raise ProviderLookupError.new('unknown_code_type', language)
    end
    raise ProviderLookupError.new('no_icd_chop_data', language) if data.nil?
    data
  end

  # @param field_codes [Array] an array of fs codes (2-210)
  # @return An array of field codes formatted as by API standard ({name : "...",
  # relatedness: relatedness, field: code} for each code, that is an array of
  # FieldEntry objects)
  def fs_codes_to_fields(field_codes, relatedness, lang)
    assert_kind_of(Array, field_codes)
    assert_relatedness(relatedness)
    assert_language(lang)

    out = []
    field_codes.each do |fc|
      out << fs_code_to_field_entry(fc, relatedness, lang)
    end
    out
  end

  # same as above, but just for one code
  def fs_code_to_field_entry(fs_code, relatedness, lang)
    assert_relatedness(relatedness)
    assert_language(lang)
    assert_kind_of(Numeric, fs_code)
    FieldEntry.new(self.db.get_fs_name(fs_code, lang),
                   relatedness,
                   fs_code
    )
  end
end
