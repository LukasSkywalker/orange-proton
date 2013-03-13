class MockInfoProvider
  def get_icd_data(field_code, lang)
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

  def get_fields(field_code, max_count, lang)
    [
        {
            :name => 'Allgemeine Medizin',
            :relatedness => 0.8,
            :field => 200,
            :type => :chop
        }
    ]
  end

  def get_field_name(field_code, lang)
    'Allgemeine Medizin'
  end
end