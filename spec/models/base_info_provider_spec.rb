require 'spec_helper'

describe BaseInformationProvider do

  before do
    @provider = BaseInformationProvider.new
  end

  it 'should find code type of chop' do
    @provider.get_code_type('00.4D').should be :chop
    @provider.get_code_type('89.d3.5C').should be :chop
    @provider.get_code_type('99.B6.11').should be :chop
    @provider.get_code_type('Z55.69.0').should be :chop
  end

  it 'should find code type of icd' do
    @provider.get_code_type('A66.0').should be :icd
    @provider.get_code_type('K58').should be :icd
    @provider.get_code_type('Z09.22').should be :icd
  end

  it 'should find code type of unknown' do
    @provider.get_code_type('A').should be :unknown
    @provider.get_code_type('C0.4d').should be :unknown
    @provider.get_code_type('z45.P').should be :unknown
    @provider.get_code_type('SS5.22').should be :unknown
    @provider.get_code_type('999.b6.11').should be :unknown
  end

  it 'should recognize super and subclasses' do
    @provider.icd_subclass?('A00.9').should be_true
    @provider.icd_subclass?('A00').should be_false
    @provider.to_icd_superclass('A00.9').should eq('A00')
  end

  it 'should normalize relatedness' do
    before_normalizing = [FieldEntry.new("first", 2, 122),
                          FieldEntry.new("second", 1, 123),
                          FieldEntry.new("third", 0.5, 124)]

    after_normalizing =  [FieldEntry.new("first", 1.0, 122),
                          FieldEntry.new("second", 0.5, 123),
                          FieldEntry.new("third", 0.25, 124)]

    @provider.normalize_relatedness(before_normalizing).should eq(after_normalizing)
  end

  it 'should raise errors if unimplemented methods are called' do
    expect {@provider.get_fields('code', 0, 'language')}.to raise_error(NotImplementedError)
    expect {@provider.get_doctors('field_code', 0, 0, 0)}.to raise_error(NotImplementedError)
    expect {@provider.get_field_name('fieldcode', 'language')}.to raise_error(NotImplementedError)
    expect {@provider.get_icd_or_chop_data('code', 'language')}.to raise_error(NotImplementedError)
  end

end
