#encoding: utf-8
require 'spec_helper'

describe ThesaurInfoProvider do

  before do
    @provider = ThesaurInfoProvider.new
    @db = @provider.db

    @db.stub(:get_available_thesaur_names).and_return ['chirurgie', 'gynäkologie']
    @db.stub(:get_fs_codes_for_thesaur_named).with('chirurgie').and_return [2,3]
    @db.stub(:get_fs_codes_for_thesaur_named).with('gynäkologie').and_return [4,5]

    @db.stub(:get_fs_name).with(2, anything).and_return('Allg. Chirurgie')
    @db.stub(:get_fs_name).with(3, anything).and_return('Plast. Chirurgie')
    @db.stub(:get_fs_name).with(4, anything).and_return('Allg. Gynäkologie')
    @db.stub(:get_fs_name).with(5, anything).and_return('Invasive Gynäkologie')
  end

  it 'should only return fields of first thesaur fs codes' do
    @db.stub(:is_icd_code_in_thesaur_named?).and_return true, false

    @db.should_receive(:get_available_thesaur_names).exactly(:once)
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'chirurgie')
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'gynäkologie')


    fields = @provider.get_fields('B26.9', 4, 'icd_2012_ch')

    fields.should have_at_most(4).items
    fields.should ==[FieldEntry.new(1, 2), FieldEntry.new(1, 3)]
  end

  it 'should only return fields of second thesaur fs codes' do
    @db.stub(:is_icd_code_in_thesaur_named?).and_return false, true

    @db.should_receive(:get_available_thesaur_names).exactly(:once)
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'chirurgie')
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'gynäkologie')

    fields = @provider.get_fields('B26.9', 4, 'icd_2012_ch')

    fields.should have_at_most(4).items
    fields.should ==[FieldEntry.new(1, 4), FieldEntry.new(1, 5)]
  end

  it 'should return all fields of all thesaurs' do
    @db.stub(:is_icd_code_in_thesaur_named?).and_return true

    @db.should_receive(:get_available_thesaur_names).exactly(:once)
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'chirurgie')
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'gynäkologie')

    fields = @provider.get_fields('B26.9', 4, 'icd_2012_ch')

    fields.should have_at_most(4).items
    fields.should ==[FieldEntry.new(1, 2),
                     FieldEntry.new(1, 3),
                     FieldEntry.new(1, 4),
                     FieldEntry.new(1, 5)]

  end

  it 'should return empty array if ICD is not in any thesaur' do
    @db.stub(:is_icd_code_in_thesaur_named?).and_return false

    @db.should_receive(:get_available_thesaur_names).exactly(:once)
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'chirurgie')
    @db.should_receive(:is_icd_code_in_thesaur_named?).with('B26.9', 'gynäkologie')

    @db.should_not_receive(:get_fs_name)

    fields = @provider.get_fields('B26.9', 4, 'icd_2012_ch')

    fields.should be_empty
  end
end