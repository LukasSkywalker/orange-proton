#encoding: utf-8
require 'spec_helper'

describe MDCInfoProvider do

  before do
    @provider = MDCInfoProvider.new
    @db = @provider.db
  end

  it 'should return an empty array for unknown code' do
    field = @provider.get_fields('C8.45', 1, 'icd_2012_ch')
    field.should==[]
  end

  it 'should return duplicated fields only once for icd' do
    @db.stub(:get_drgs_for_code).with('B26.9', 'icd_2012_ch').and_return ['T63B', 'T63A']
    @db.stub(:get_mdc_code).with(anything).and_return ['18B', '18B']
    @db.stub(:get_fs_code_by_mdc).with(anything).and_return [74, 74]

    field = @provider.get_fields('B26.9', 4, 'icd_2012_ch')

    field.should==[FieldEntry.new(1, 74)]
    field.should_not be([FieldEntry.new(1, 74), FieldEntry.new(1, 74)])
  end

  it 'should not return more than max count for icd' do
    @db.stub(:get_drgs_for_code).with('B20', 'icd_2012_ch').and_return ['S63B', 'V60B', 'O01C']
    @db.stub(:get_mdc_code).with(anything).and_return ['18A', 20, 14]
    @db.stub(:get_fs_code_by_mdc).with(anything).and_return [74, 90, 39]

    field = @provider.get_fields('B20', 2, 'icd_2012_ch')

    field.should==[FieldEntry.new(1, 74), FieldEntry.new(1, 90)]
    field.should_not be([FieldEntry.new(1, 74), FieldEntry.new(1, 90), FieldEntry.new(1, 39)])
  end

  it 'should return duplicated fields only once and not more than max count for chop' do
    @db.stub(:get_drgs_for_code).with('85.33', 'chop_2012_ch').and_return ['J24B', 'J06Z', 'J06Z']
    @db.stub(:get_mdc_code).with(anything).and_return [9, 9, 9]
    @db.stub(:get_fs_code_by_mdc).with(anything).and_return [7, 12, 37]

    field = @provider.get_fields('85.33', 2, 'chop_2012_ch')

    field.should==[FieldEntry.new(1, 7), FieldEntry.new(1, 12)]
    field.should_not be([FieldEntry.new(1, 7), FieldEntry.new(1, 12), FieldEntry.new(1, 37)])
  end
end