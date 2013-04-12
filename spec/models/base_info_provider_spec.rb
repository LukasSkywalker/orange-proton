require 'spec_helper'

describe BaseInformationProvider do

  before do
    @provider = BaseInformationProvider.new
  end

  it 'should find code type of chop' do
    chop1 = '00.4D'
    chop2 = '89.d3.5C'
    chop3 = '99.B6.11'

    @provider.get_code_type(chop1).should be :chop
    @provider.get_code_type(chop2).should be :chop
    @provider.get_code_type(chop3).should be :chop
  end

  it 'should find code type of icd' do
    icd1 = 'A66.0'
    icd2 = 'K58'
    icd3 = 'Z09.22'

    @provider.get_code_type(icd1).should be :icd
    @provider.get_code_type(icd2).should be :icd
    @provider.get_code_type(icd3).should be :icd
  end

  it 'should find code type of unknown' do
    unknown1 = 'A'
    unknown2 = 'C0.4d'
    unknown3 = 'z45.P'
    unknown4 = 'G33.66.66'
    unknown5 = '999.b6.11'
    unknown6 = 'SS5.22'

    @provider.get_code_type(unknown1).should be :unknown
    @provider.get_code_type(unknown2).should be :unknown
    @provider.get_code_type(unknown3).should be :unknown
    @provider.get_code_type(unknown4).should be :unknown
    @provider.get_code_type(unknown5).should be :unknown
    @provider.get_code_type(unknown6).should be :unknown
  end

  it 'should recognize super and subclasses' do
    sub = 'A00.9'
    sup = 'A00'

    @provider.icd_subclass?(sub).should be_true
    @provider.icd_subclass?(sup).should be_false
    @provider.to_icd_superclass(sub).should eq(sup)
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

  it 'should raise errors' do
    expect {@provider.get_fields('code', 0, 'language')}.to raise_error(NotImplementedError)
    expect {@provider.get_doctors('field_code', 0, 0, 0)}.to raise_error(NotImplementedError)
    expect {@provider.get_field_name('fieldcode', 'language')}.to raise_error(NotImplementedError)
    expect {@provider.get_icd_or_chop_data('code', 'language')}.to raise_error(NotImplementedError)
  end

end
