#encoding: utf-8
require 'spec_helper'

describe RangeInfoProvider do
  before do
    @provider = RangeInfoProvider.new
    @icd = 'C30'  # Tumeur maligne des fosses nasales et de l'oreille moyenne

    @field1 = FieldEntry.new("Cytopathologie", 0.7, 125)
    @field2 = FieldEntry.new("Radio-oncologie / radiothérapie", 1, 103)
    @field3 = FieldEntry.new("Onco-hématologie pédiatrique", 0.7, 117)
    @field4 = FieldEntry.new("Oncologie médicale", 1, 96)
  end

  it 'should include these ICDs' do
    var = @provider.get_fields(@icd, 4, 'fr')
    var.should include(@field1, @field2, @field3, @field4)
  end
end