# This provider returns some example data to show the format to be followed
# by the other providers.
# It can also be used for testing.
class MockLocalisedDataProvider

  # @raise [RuntimeError]
  def get_icd_or_chop_data(code, language, catalog)
    assert_code(code) # we are replying with an icd code here, don't ask for something
    # else! PF: Which test failed when this was assert_icd_code???
    assert_language(language)
    {
      data: {
        :superclass => 'B26',
        :text => 'Mumps',
        :subclasses => %w(B26.3 B26.6),
        :synonyms => %w(Ziegenpeter Alpoehi Heidi),
        :drgs => %w(A13F A13C A13D),
        :superclass_text => 'SomeTextHere'
       },
      :language => "de"
    }
  end

  # The mock can't localise anything.
  def localise_field_entries(api_fields_array, language)

  end

end
