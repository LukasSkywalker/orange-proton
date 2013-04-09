require 'spec_helper'

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
    @tfs2 = client['thesauren']['thesaurusToFSCode2']

  end

  it 'should match the fachgebieteUndSpezialisierungen collections' do
    @fs.count().should eq(110)
    #@f.count().should eq(47)
    #@s.count().should eq(63)
  end

  it 'should match the thesauren collections' do
    #@t_chirurgie.count().should eq(643)
  end
end
