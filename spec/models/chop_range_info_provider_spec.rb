#encoding: utf-8
require 'spec_helper'

describe ChopRangeInfoProvider do

  before do
    @provider = ChopRangeInfoProvider.new
    @db = @provider.db

    @hash1 = {'beginning'=>'42', 'ending'=>'54', 'fmhcodes'=>[136.0, 85.0]}
    @hash2 = {'beginning'=>'85', 'ending'=>'86', 'fmhcodes'=>[85.0, 7.0]}
    @hash3 = {'beginning'=>'85', 'ending'=>'86', 'fmhcodes'=>[7.0]}
  end

  it 'should return an empty array for chop code' do
    field = @provider.get_fields('C30', 1, 'icd_2010_ch')
    field.should==[]
  end

  it 'should increase relatedness for duplicated fmhcodes' do
    # stub without duplication
    @db.stub(:get_chop_ranges).with('52.7').and_return [@hash1, @hash3]
    field = @provider.get_fields('52.7', 4, 'chop_2012_ch')
    field.should==[FieldEntry.new(1, 136), FieldEntry.new(1, 85), FieldEntry.new(1, 7)]

    # stub with duplication
    @db.stub(:get_chop_ranges).with('52.7').and_return [@hash1, @hash2]
    field = @provider.get_fields('52.7', 4, 'chop_2012_ch')
    field.should==[FieldEntry.new(1, 136), FieldEntry.new(1, 85), FieldEntry.new(1, 7)]
  end

  it 'should not return more fields than max count' do
    @db.stub(:get_chop_ranges).with('85.33').and_return [@hash1]
    field = @provider.get_fields('85.33', 1, 'chop_2012_ch')

    field.should==[FieldEntry.new(1, 136)]
    field.should_not be([FieldEntry.new(1, 136), FieldEntry.new(1, 85)])
  end

end