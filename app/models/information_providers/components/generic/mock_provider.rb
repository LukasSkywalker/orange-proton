# This provider returns some example data to show the format to be followed
# by the other providers.
# It can also be used for testing.
class MockInfoProvider

  def get_fields(code, count, catalog)
    assert_code(code)
    assert_count(count)
    [
        FieldEntry.new(0.8, 200),
        FieldEntry.new(0.7, 200),
        FieldEntry.new(0.6, 200)
    ]
  end

  def get_icd_or_chop_data(code, language)
    assert_code(code) # we are replying with an icd code here, don't ask for something
    # else!
    assert_language(language)
    {
        :superclass => 'B26',
        :text => 'Mumps',
        :subclasses => %w(B26.3 B26.6),
        :synonyms => %w(Ziegenpeter Alpoehi Heidi),
        :drgs => %w(A13F A13C A13D),
        :superclass_text => 'SomeTextHere'
    }
  end

end
