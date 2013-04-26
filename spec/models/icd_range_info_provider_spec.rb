#encoding: utf-8
require 'spec_helper'

describe IcdRangeInfoProvider do

  before do
    @provider = IcdRangeInfoProvider.new
    @db = @provider.db

    @hash1 = {'level'=>1, 'beginning'=>'A00', 'ending'=>'B99', 'fmhcodes'=>[74]}
    @hash2 = {'level'=>2, 'beginning'=>'B20', 'ending'=>'B24', 'fmhcodes'=>[7]}
    @hash3 = {'level'=>2, 'beginning'=>'B20', 'ending'=>'B24', 'fmhcodes'=>[74, 7]}
  end

  it 'should return an empty array for chop code' do
    field = @provider.get_fields('85.33', 1, 'chop_2012_ch')
    field.should==[]
  end

  it 'should increase relatedness for duplicated fhmcodes' do
    # stub without duplication
    @db.stub(:get_icd_ranges).with('B20').and_return [@hash1, @hash2]
    field = @provider.get_fields('B20', 3, 'icd_2012_ch')
    field.should==[FieldEntry.new(0.2, 74), FieldEntry.new(0.6, 7)]

    # stub with duplication
    @db.stub(:get_icd_ranges).with('B20').and_return [@hash1, @hash3]
    field = @provider.get_fields('B20', 3, 'icd_2012_ch')
    field.should==[FieldEntry.new(0.6, 74), FieldEntry.new(0.54, 7)]
  end

  it 'should not return more fields than max count' do
    # calculate with duplicated relatedness
    @db.stub(:get_icd_ranges).with('B20').and_return [@hash1, @hash3]
    field = @provider.get_fields('B20', 1, 'icd_2012_ch')

    field.should==[FieldEntry.new(0.6, 74)]
    field.should_not be([FieldEntry.new(0.2, 74)])
  end
end