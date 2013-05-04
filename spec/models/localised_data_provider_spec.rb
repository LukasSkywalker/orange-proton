#encoding: utf-8
require 'spec_helper'

describe LocalisedDataProvider do
  before do
    @p = LocalisedDataProvider.new
  end

  it 'should return localised data for code' do
     d = @p.get_icd_or_chop_data('B26', 'de', 'icd_2012_ch')
     puts d
     (d[:data]["inclusiva"].include?("Infektiöse Parotitis")).should eq(true)
  end

  it 'should be able to localise fields' do
    a = [FieldEntry.new(1, 2)]

    a[0].name.should eq("<unlocalized 2>")
    @p.localise_field_entries a, 'de'

    a[0].name.should eq("Anästhesiologie")
  end
end
