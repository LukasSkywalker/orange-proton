#encoding: utf-8
require 'spec_helper'

describe ThesaurInfoProvider do

  before do
    @provider = ThesaurInfoProvider.new
    @icd = 'K66.0'  # Peritoneale Adhäsionen
  end

  it 'should include these specialities' do
    field1 = FieldEntry.new('Gynäkologische Onkologie', 1, 120)
    field2 = FieldEntry.new('Frauenkrankheiten und Geburtshilfe (Gynäkologie und Geburtshilfe)', 1, 10)
    field3 = FieldEntry.new('Schwangerschaftsultraschall', 1, 71)
    field4 = FieldEntry.new('Reproduktionsmedizin und gynäkologische Endokrinologie', 1, 104)

    var = @provider.get_fields(@icd, 4, 'de')
    var.should include(field1, field2, field3, field4)
  end
end