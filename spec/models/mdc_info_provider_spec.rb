#encoding: utf-8
require 'spec_helper'

describe MDCInfoProvider do

  before do
    @provider = MDCInfoProvider.new
    @icd = 'B26.9'  # Parotite epidemica senza complicanze
  end

  #it 'should include these specialities' do
  #  field1 = FieldEntry.new('Malattie infettive', 1, 74)
  #  field2 = FieldEntry.new('Medicina generale', 1, 5)
  #  field3 = FieldEntry.new('medicina interna generale', 1, 162)
  #
  #  var = @provider.get_fields(@icd, 3, 'it')
  #  var.should include(field1, field2, field3)
  #end

end