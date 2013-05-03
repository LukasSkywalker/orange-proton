#encoding: utf-8
require 'spec_helper'

# makes private methods public to make them testable
class CompoundInfoProvider
  public :extract_fields_with_code_in, :generate_compound_fields, :get_provider_results
end

describe CompoundInfoProvider do
  before do
    @provider = CompoundInfoProvider.new
    @db = @provider.db
  end

  it 'should extract fields' do
    fields = [FieldEntry.new(0.11, 74),FieldEntry.new(0.11, 74), FieldEntry.new(0.5, 48)]
    codes = [74, 74, 48]
    results = @provider.extract_fields_with_code_in(fields, codes)
    results.should==[]
  end

  it 'should get fields' do
    @db.stub(:get_provider_results).with(anything, 3, anything).and_return [FieldEntry.new(0.4, 74), FieldEntry.new(0.5, 48), FieldEntry.new(0.8, 41), FieldEntry.new(0.8, 41)]
    field = @provider.get_fields('A01.0', 6, 'icd_2010_ch')
    field.should==[FieldEntry.new(0.964, 74), FieldEntry.new(0.84, 85), FieldEntry.new(0.8, 41)]
  end

end
