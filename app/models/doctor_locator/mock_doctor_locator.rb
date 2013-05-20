# Used in tests.
class MockDoctorLocator
  def find_doctors(field_code, lat, long, count)
    assert_field_code(field_code)
    assert_count(count)
    [
      # Sample entry
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
end
