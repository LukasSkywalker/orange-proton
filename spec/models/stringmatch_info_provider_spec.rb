#encoding: utf-8
require 'spec_helper'

describe MDCInfoProvider do

  before do
    @sampleentry = {
        "code" => "A00",
        "text" => "Cholera",

    }
    @returned_keywords = [
        {
        "keyword" => 'bla',
        "exklusiva" => [],
        "fmhcodes" => [92]
        }
    ]
    @provider = StringmatchInfoProvider.new
    @db = @provider.db
    @db.stub(:get_fs_name).with(1, anything).and_return('codologie')


  end

  it 'should recognize keyword' do
    @sampleentry["text"] = 'This is a TEST'
    @db.stub(:get_icd_entry).with(anything, 'de').and_return(@sampleentry)
    @returned_keywords[0]['keyword'] = 'Test'
    @returned_keywords[0]['fmhcodes'] = [1]
    @db.stub(:get_fachgebiete_keywords).and_return(@returned_keywords)

    fields = @provider.get_fields('B00',4,'de')

    fields.should ==[FieldEntry.new('codologie', 1, 1)]
  end

  it 'should not recognize keyword not contained' do
    @sampleentry['text'] = 'This is a TEST'
    @db.stub(:get_icd_entry).with(anything, 'de').and_return(@sampleentry)
    @returned_keywords[0]['keyword'] = 'Teste'
    @returned_keywords[0]['fmhcodes'] = [1]
    @db.stub(:get_fachgebiete_keywords).and_return(@returned_keywords)

    fields = @provider.get_fields('B00',4,'de')

    fields.should ==[]
  end

  it 'should not recognize keyword with exklusiva' do
    @sampleentry["text"] = 'This is a TEST'
    @db.stub(:get_icd_entry).with(anything, 'de').and_return(@sampleentry)
    @returned_keywords[0]['keyword'] = 'Test'
    @returned_keywords[0]['exklusiva'] = ['is']
    @returned_keywords[0]['fmhcodes'] = [1]
    @db.stub(:get_fachgebiete_keywords).and_return(@returned_keywords)

    fields = @provider.get_fields('B00',4,'de')

    fields.should ==[]
  end

end