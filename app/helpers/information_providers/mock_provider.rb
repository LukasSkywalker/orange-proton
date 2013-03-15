require_relative 'base_information_provider'

class MockInfoProvider < BaseInformationProvider

  def get_fields(field_code, count, lang)
    {
        :data => get_icd_data,
        :fields => get_fields_of_specialization(field_code, count, lang),
        :type => get_code_type(field_code)
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
    {
        :name => 'Allgemeine Medizin'
    }
  end

  # private Helpers
  private
  def get_fields_of_specialization(field_code, max_count, lang)
    [
        {
            :name => 'Allgemeine Medizin',
            :relatedness => 0.8,
            :field => 200
        }
    ]
  end

  def get_icd_data
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