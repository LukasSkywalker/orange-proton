#encoding: utf-8
require 'spec_helper'

# makes private methods public to make them testable
class CompoundInfoProvider
  public :remove_duplicate_fields, :fields_multiply_relatedness
end

describe CompoundInfoProvider do
  before(:each) do

    @provider = CompoundInfoProvider.new
    @icd = 'A00.0'  # Cholera durch Vibrio cholerae O:1, Biovar cholerae

    @field1 = FieldEntry.new('Gastroenterology', 0.75, 85)
    @field2 = FieldEntry.new('Gastroenterology', 0.6000000000000001, 85)
    @field3 = FieldEntry.new('paediatric gastroenterology and hepatology', 0.75, 113)
    @field4 = FieldEntry.new('Infectiology', 0.6000000000000001, 74)
    @field5 = FieldEntry.new('Gastroscopy', 0.75, 149)
    @field6 = FieldEntry.new('Psychiatry and psychotherapy', 0.195, 39)
    @field7 = FieldEntry.new('molecular pathology', 0.3, 123)
  end

  it 'should multiply relatedness fields' do
    field_one = FieldEntry.new('Gastroenterology', 0.3, 85)
    field_two = FieldEntry.new('molecular pathology', 0.09, 123)
    fields = [field_one, field_two]

    var = @provider.fields_multiply_relatedness(fields, 0.3)
    var.should include(field_one, field_two)
  end

  #it 'should get all provider results' do
  #  var = @provider.get_provider_results(@icd, 7, 'en')
  #  var.should include(@field1, @field2, @field3, @field4, @field5, @field6, @field7)
  #end

  it 'should remove duplicate fields' do
    var = @provider.remove_duplicate_fields([@field1, @field2, @field3])
    var.should include(@field1, @field3)
    var.should_not include(@field2)
  end

  it 'should not raise error for ICD C64 Issue #217' do
    expect{@provider.get_fields('C64', 4, 'de')}.to_not raise_error(NoMethodError)
  end
end