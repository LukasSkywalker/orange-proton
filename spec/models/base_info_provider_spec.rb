require 'spec_helper'

describe BaseInformationProvider do
  before do
    @provider = BaseInformationProvider.new

    @chop1 = '00.4D'
    @chop2 = '89.d3.5C'
    @chop3 = '99.B6.11'

    @icd1 = 'a66.0'
    @icd2 = 'K58'
    @icd3 = 'Z09.22'

    @unknown1 = 'A'
    @unknown2 = 'c0.4d'
    @unknown3 = 'z45.P'
    @unknown4 = 'g3.66.66'
    @unknown5 = '999.b6.11'
    @unknown6 = 'ss5.22'

    @sub = 'A00.9'
    @sup = 'A00'

    @before_normalizing = [FieldEntry.new("first", 2, 122),
                           FieldEntry.new("second", 1, 123),
                           FieldEntry.new("third", 0.5, 124)]

    @after_normalizing =  [FieldEntry.new("first", 1.0, 122),
                           FieldEntry.new("second", 0.5, 123),
                           FieldEntry.new("third", 0.25, 124)]
  end

  it 'should find code type of chop' do
    @provider.get_code_type(@chop1).should be :chop
    @provider.get_code_type(@chop2).should be :chop
    @provider.get_code_type(@chop3).should be :chop
  end

  it 'should find code type of icd' do
    @provider.get_code_type(@icd1).should be :icd
    @provider.get_code_type(@icd2).should be :icd
    @provider.get_code_type(@icd3).should be :icd
  end

  it 'should find code type of unknown' do
    @provider.get_code_type(@unknown1).should be :unknown
    @provider.get_code_type(@unknown2).should be :unknown
    @provider.get_code_type(@unknown3).should be :unknown
    @provider.get_code_type(@unknown4).should be :unknown
    @provider.get_code_type(@unknown5).should be :unknown
    @provider.get_code_type(@unknown6).should be :unknown
  end

  it 'should recognize super and subclasses' do
    @provider.icd_subclass?(@sub).should be_true
    @provider.icd_subclass?(@sup).should be_false
    @provider.to_icd_superclass(@sub).should eq(@sup)
  end

  it 'should normalize relatedness' do
    @provider.normalize_relatedness(@before_normalizing).should eq(@after_normalizing)
  end

end
