#encoding: utf-8
require 'spec_helper'

describe DatabaseAdapter do

  before do
    @adapter = DatabaseAdapter.new
    @client = MongoMapper.connection
  end

  it 'should return drgs or empty field for icd code' do
    drg = @adapter.get_drgs_for_icd('A00.0')
    drg.should include('G46A', 'G67D', 'G50Z', 'G67B', 'G46B', 'G67C', 'G46C', 'A13F')

    no_drg = @adapter.get_drgs_for_icd('A00')
    no_drg.should be_empty
  end

  it 'should return drgs or empty field for chop code' do
    chop = @adapter.get_drgs_for_chop('00.10')
    chop.should include('S01Z', 'J11B', 'L18B')

    no_chop = @adapter.get_drgs_for_chop('00.4')
    no_chop.should be_empty
  end

  it 'should get an icd entry' do
    entry = @adapter.get_icd_entry('B20.9', 'en')
    entry.should eq(@client['icd_2012_ch']['en'].find_one({code: 'B20.9'}))

    no_entry = @adapter.get_icd_entry('B20.9', 'de')
    no_entry.should be(nil)                   # no error raising?
  end

  it 'should get a chop entry' do
    entry = @adapter.get_chop_entry('44.22', 'it')
    entry.should eq(@client['chop_2013_ch']['it'].find_one({code: '44.22'}))

    no_entry = @adapter.get_chop_entry('88.00', 'it')
    no_entry.should be(nil)
  end

  it 'should return all fachgebiete keywords' do
    keywords = @adapter.get_fachgebiete_keywords.count()
    keywords.should be(149)
  end

  it 'should find the fs code by mdc' do
    fs = @adapter.get_fs_code_by_mdc(15)
    fs.should==[73]
  end

  it 'should find manually mapped fs code for icd' do
    fs = @adapter.get_manually_mapped_fs_codes_for_icd('L65')
    fs.should==[7]
  end

  it 'should return all thesaur collections' do
    names = @adapter.get_available_thesaur_names
    names.should include('Orthopdie', 'Gynaekologie', 'Hausarzt', 'Paediatrie', 'Chirurgie', 'Psycho')
  end

  it 'should return all fs names for a language' do
    de = @adapter.get_fs_names('de').size
    fr = @adapter.get_fs_names('fr').size
    it = @adapter.get_fs_names('it').size
    en = @adapter.get_fs_names('en').size

    de.should be(110)
    fr.should be(110)
    it.should be(110)
    en.should be(110)
  end

  it 'should give answer whether an icd is in the thesaur' do
    yes = @adapter.is_icd_code_in_thesaur_named?('F55.2', 'Psycho')
    yes.should be_true

    no = @adapter.is_icd_code_in_thesaur_named?('I70.21', 'Paediatrie')
    no.should be_false
  end

  it 'should return fs codes for a thesaur' do
    psych_code = @adapter.get_fs_codes_for_thesaur_named('Psycho')
    psych_code.should==[39]   # = Psychiatrie und Psychotherapie

    gyn_code = @adapter.get_fs_codes_for_thesaur_named('Gynaekologie')
    gyn_code.should==[10]   # = Frauenkrankheiten und Geburtshilfe (Gynäkologie und Geburtshilfe)

    chir_code = @adapter.get_fs_codes_for_thesaur_named('Chirurgie')
    chir_code.should==[6]   # = Chirurgie

    paed_code = @adapter.get_fs_codes_for_thesaur_named('Paediatrie')
    paed_code.should==[59]   # = Kinder- und Jugendmedizin

    orth_code = @adapter.get_fs_codes_for_thesaur_named('Orthopdie')
    orth_code.should==[36, 79, 80, 154]   # 36 = Physikalische Medizin und Rehabilitation
                                          # 79 = Manuelle Medizin
                                          # 80 = Sportmedizin
                                          # 154 = Interventionelle Schmerztherapie
  end

  it 'should find the mdc code by drg prefix' do
    mdc = @adapter.get_mdc_code('T')
    mdc.should eq('18B')
  end

  it 'should find the fs name by fs code' do
    fs_name = @adapter.get_fs_name(13, 'de')
    fs_name.should eq('Innere Medizin')
  end

  it 'should find specialities from fs code' do
    specs = @adapter.get_specialities_from_fs(41)
    specs.should==['tropenaerzte']

    specs = @adapter.get_specialities_from_fs(13)
    specs.should==['internisten']
  end

  it 'should return doctors by fs code' do
    doctors = @adapter.get_doctors_by_fs(41).size
    doctors.should be(62)
  end

  it 'should find fields with character matching' do
    fields = @adapter.get_fields_by_char_match('F65', 11).size
    fields.should be(11)
  end

  # test the icd and chop ranges
end