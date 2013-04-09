require 'spec_helper'

describe ManualInfoProvider do
  before(:each) do
    @provider = ManualInfoProvider.new
    @test = DatabaseAdapter.new
    @icd = 'L65'
    @field = FieldEntry.new("Haut- und Geschlechtskrankheiten (Dermatologie und Venerologie)", 1, 7)
  end

  it 'should do something' do
    @provider.get_fields(@icd, 1, 'de').should include(@field)
    @test.get_manually_mapped_fs_codes_for_icd(@icd).should include(7.0)
  end
end