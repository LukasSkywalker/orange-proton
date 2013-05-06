#encoding: utf-8
require 'spec_helper'

# makes private methods public to make them testable
class CompoundInfoProvider
  public :extract_fields_with_code_in, :generate_compound_fields, :get_provider_results
  attr_accessor :providers
end

describe CompoundInfoProvider do
  before do
    @provider = CompoundInfoProvider.new
    @db = @provider.db
  end

  it 'should find provider results' do
    instance1 = ProviderInstance.new(MDCInfoProvider, 0.4)
    instance2 = ProviderInstance.new(IcdRangeInfoProvider, 0.6)
    instance3 = ProviderInstance.new(ThesaurInfoProvider, 1)
    instance4 = ProviderInstance.new(StringmatchInfoProvider, 0.8)
    instance5 = ProviderInstance.new(ChopRangeInfoProvider, 0.75)

    @provider.providers = [instance1, instance2, instance3, instance4, instance5]

    instance1.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.5, 72), FieldEntry.new(0.5, 72)])
    instance2.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.5, 72), FieldEntry.new(0.5, 72)])
    instance3.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.5, 72), FieldEntry.new(0.5, 72)])
    instance4.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.5, 72), FieldEntry.new(0.5, 72)])
    instance5.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.5, 72), FieldEntry.new(0.5, 72)])

    field = @provider.get_provider_results('A01.0', 1, 'icd_2010_ch')
    field.should==[]
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
