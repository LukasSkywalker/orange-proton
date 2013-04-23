#encoding: utf-8
require 'spec_helper'

describe ChopRangeInfoProvider do

  before do
    @provider = ChopRangeInfoProvider.new
  end

=begin
  it 'should include these specialities' do
    chop = '01'
    field1 = FieldEntry.new('Gehirn- und Nervenchirurgie (Neurochirurgie)', 1, 26)
    field2 = FieldEntry.new('Nervenkrankheiten (Neurologie)', 1, 27)

    var = @provider.get_fields(chop, 1, 'de')
    var.should include(field1, field2)
  end
=end
end