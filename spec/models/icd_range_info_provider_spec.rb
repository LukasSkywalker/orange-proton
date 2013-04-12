#encoding: utf-8
require 'spec_helper'

describe IcdRangeInfoProvider do

  before do
    @provider = IcdRangeInfoProvider.new
  end

  it 'should include these specialities' do
    icd = 'C30'  # Tumeur maligne des fosses nasales et de l'oreille moyenne

    field1 = FieldEntry.new('Cytopathologie', 0.7, 125)
    field2 = FieldEntry.new('Radio-oncologie / radiothérapie', 1, 103)
    field3 = FieldEntry.new('Onco-hématologie pédiatrique', 0.7, 117)
    field4 = FieldEntry.new('Oncologie médicale', 1, 96)

    var = @provider.get_fields(icd, 4, 'fr')
    var.should include(field1, field2, field3, field4)
  end

  it 'S69.9 should include these specialities' do
    icd = 'S69.9'
    field1 = FieldEntry.new('Handchirurgie', 0.8, 129)

    var = @provider.get_fields(icd, 4, 'de')
    var.should include(field1)
  end
end