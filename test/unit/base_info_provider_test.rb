require 'test/unit'
require 'minitest/reporters'
require_relative '../../app/helpers/information_providers/base_information_provider'

MiniTest::Reporters.use!

class BaseInfoProviderTest < Test::Unit::TestCase

  def setup
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

  def test_chop
    assert(@provider.get_code_type(@chop1) == :chop)
    assert(@provider.get_code_type(@chop2) == :chop)
    assert(@provider.get_code_type(@chop3) == :chop)
  end

  def test_icd
    assert(@provider.get_code_type(@icd1) == :icd)
    assert(@provider.get_code_type(@icd2) == :icd)
    assert(@provider.get_code_type(@icd3) == :icd)
  end

  def test_unknown
    assert(@provider.get_code_type(@unknown1) == :unknown)
    assert(@provider.get_code_type(@unknown2) == :unknown)
    assert(@provider.get_code_type(@unknown3) == :unknown)
    assert(@provider.get_code_type(@unknown4) == :unknown)
    assert(@provider.get_code_type(@unknown5) == :unknown)
    assert(@provider.get_code_type(@unknown6) == :unknown)
  end
end