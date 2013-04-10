#encoding: utf-8
require 'spec_helper'

describe ManualInfoProvider do

  before do
    @provider = ManualInfoProvider.new
    @icd = 'L65' # sonstiger Haarausfall ohne Narbenbildung
  end

  it 'should include these specialities' do
    field = FieldEntry.new('Haut- und Geschlechtskrankheiten (Dermatologie und Venerologie)', 1, 7)

    var = @provider.get_fields(@icd, 1, 'de')
    var.should include(field)
  end
end