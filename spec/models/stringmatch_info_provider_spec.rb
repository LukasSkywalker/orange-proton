#encoding: utf-8
require 'spec_helper'

class DatabaseInfoProvider
  attr_reader :db   # we need to be able to access this in order to stub it.
end


describe StringmatchInfoProvider do

  before do
    @sampleentry = {'code' => "A00", 'text' => "Cholera"}
    @returned_dictionary = [{'keyword' => 'bla', 'exklusiva' => [], 'fmhcodes' => [92]}]

    @provider = StringmatchInfoProvider.new
    @db = @provider.db

    @db.stub(:assert_catalog).and_return(true)
    @db.stub(:get_catalog_entry).and_return(@sampleentry)

    @db.stub(:get_icd_dictionary).and_return(@returned_dictionary)
    @db.stub(:get_chop_dictionary).and_return(@returned_dictionary)
  end

  it 'should recognize keyword' do
    @sampleentry['text'] = 'This is a TEST'
    @db.stub(:get_catalog_entry).with(anything, 'de', 'icd_2012_ch').and_return(@sampleentry)
    @returned_dictionary[0]['keyword'] = 'Test'
    @returned_dictionary[0]['fmhcodes'] = [2]

    fields = @provider.get_fields('B00',4,'icd_2012_ch')
    fields.should ==[FieldEntry.new(1, 2)]
  end

  it 'should not recognize keyword not contained' do
    @sampleentry['text'] = 'This is a TEST'
    @db.stub(:get_icd_entry).with(anything, 'de').and_return(@sampleentry)
    @returned_dictionary[0]['keyword'] = 'Teste'
    @returned_dictionary[0]['fmhcodes'] = [2]

    fields = @provider.get_fields('B00',4,'icd_2012_ch')
    fields.should ==[]
  end

  it 'should not recognize keyword with exklusiva' do
    @sampleentry["text"] = 'This is a TEST'
    @db.stub(:get_icd_entry).with(anything, 'de').and_return(@sampleentry)
    @returned_dictionary[0]['keyword'] = 'Test'
    @returned_dictionary[0]['exklusiva'] = ['is']
    @returned_dictionary[0]['fmhcodes'] = [2]

    fields = @provider.get_fields('B00',4,'icd_2012_ch')
    fields.should ==[]
  end

  it 'should return nothing when keyword is not available in german' do
    @provider.get_fields('B20.9', 1, 'icd_2012_ch')==[] # this icd code does not exist
  end

end