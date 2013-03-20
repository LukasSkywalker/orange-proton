require 'spec_helper'

describe BaseInformationProvider do
  before(:each) do
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
  end

  it 'should find code type of chop' do
    @provider.get_code_type(@chop1).should be :chop
    @provider.get_code_type(@chop2).should be :icd
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

end
