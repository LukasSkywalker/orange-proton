# This provider returns some example data to show the format to be followed
# by the other providers.
# It can also be used for testing.
class MockInfoProvider < BaseInformationProvider

  def get_fields(code, count, lang)
    [
        FieldEntry.new('Allgemeine Medizin', 0.8, 200),
        FieldEntry.new('Allgemeine Medizin', 0.7, 200),
        FieldEntry.new('Allgemeine Medizin', 0.6, 200),
    ]
  end

  def get_icd_or_chop_data(code, language)
    raise ProviderLookupError.new('no_icd_chop_data', 'de') if code == 'X32'
    {
        :superclass => 'B26',
        :text => 'Mumps',
        :subclasses => %w(B26.3 B26.6),
        :synonyms => %w(Ziegenpeter Alpoehi Heidi),
        :drgs => %w(A13F A13C A13D),
        :superclass_text => 'SomeTextHere'
    }
  end

  def get_doctors(field_code, lat, long, count)
    [
        {
            :name => 'Hans Wurst',
            :title => 'Dr. med. dent. Zahnarzt FMH',
            :address => 'Entenstr. 23, 3000 Entenhausen',
            :email => 'doctor@frankenstein.ch',
            :phone1 => '031 791 30 30',
            :phone2 => '031 791 30 31',
            :canton => 'BE',
            :docfield => 'Internisten'
        }
    ]
  end

  def get_field_name(field_code, lang)
    'Allgemeine Medizin'
  end
end
