require 'spec_helper'

# this class is testing the number of codes and no functionality
describe DatabaseAdapter do
  before do
    @db = DatabaseAdapter.new
    client = MongoMapper.connection

    @fs = client['fachgebieteUndSpezialisierungen']['fachgebieteUndSpezialisierungen']
    @f = client['fachgebieteUndSpezialisierungen']['fachgebiete']
    @s = client['fachgebieteUndSpezialisierungen']['spezialisierungen']

    @t_chirurgie = client['thesauren']['Chirurgie']
    @t_gynaekologie = client['thesauren']['Gynaekologie']
    @t_hausarzt = client['thesauren']['Hausarzt']
    @t_orthopdie = client['thesauren']['Orthopdie']
    @t_paediatrie = client['thesauren']['Paediatrie']
    @t_psycho = client['thesauren']['Psycho']
    @tfs1 = client['thesauren']['thesaurusToFSCode']

    @icd_de = client['icd_2012_ch']['de']
    @icd_fr = client['icd_2012_ch']['fr']
    @icd_it = client['icd_2012_ch']['it']
    @icd_en = client['icd_2012_ch']['en']

    @chop_de = client['chop_2013_ch']['de']
    @chop_fr = client['chop_2013_ch']['fr']
    @chop_it = client['chop_2013_ch']['it']

    @mdc_fs = client['mdc']['mdcCodeToFSCode']
    @mdc_name = client['mdc']['mdcNames']

    @range_icd = client['ICDRangeFSH']['mappings']
    @range_chop = client['CHOPRangeFSH']['mappings']

    @doc_fs = client['doctors']['docfieldToFSCode']
    @docs = client['doctors']['doctors']

    @keywords = client['fachgebieteKeywords']['fachgebieteKeywords']
  end

  it 'should match the fachgebieteUndSpezialisierungen collections' do
    @fs.count().should eq(110)
    @f.count().should eq(47)
    @s.count().should eq(63)
  end

  it 'should match the thesauren collections' do
    @t_chirurgie.count().should eq(643)
    @t_gynaekologie.count().should eq(696)
    @t_hausarzt.count().should eq(723)
    @t_orthopdie.count().should eq(551)
    @t_paediatrie.count().should eq(465)
    @t_psycho.count().should eq(456)
    @tfs1.count().should eq(8)
  end

  it 'should match the icd collections' do
    @icd_de.count().should be(11266)
    @icd_fr.count().should be(11266)
    @icd_it.count().should be(11265)
    @icd_en.count().should be(11077)
  end

  it 'should match the chop collections' do
    @chop_de.count().should be(14799)
    @chop_fr.count().should be(14799)
    @chop_it.count().should be(14799)
  end

  it 'should match the mdc collections' do
    @mdc_fs.count().should be(51)
    @mdc_name.count().should be(28)
  end

  it 'should match the icd range collection' do
    @range_icd.count().should be(270)
  end

  it 'should match the chop range collection' do
    @range_chop.count().should be(15)
  end

  it 'should match the doctors collections' do
    @doc_fs.count().should be(152)
    @docs.count().should be(25528)
  end

  #it 'should match the keywords collection' do
  #  @keywords.count().should be(157)
  #end

  it 'should not raise error when get_mdc_code is called with undefined prefix, \'9\' (Issue #127)' do
    expect{@db.get_mdc_code('9')}.to_not raise_error NoMethodError
  end

  it 'should return nil when get_mdc_code is called with undefined prefix, \'9\' (Issue #127)' do
    @db.get_mdc_code('9').should be nil
  end

end
