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

  it 'should find provider results for each provider class' do
    instance1 = ProviderInstance.new(MDCInfoProvider, 0.4)
    instance2 = ProviderInstance.new(IcdRangeInfoProvider, 0.6)
    instance3 = ProviderInstance.new(ThesaurInfoProvider, 1)
    instance4 = ProviderInstance.new(StringmatchInfoProvider, 0.8)
    instance5 = ProviderInstance.new(ChopRangeInfoProvider, 0.75)

    @provider.providers = [instance1, instance2, instance3, instance4, instance5]

    instance1.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.9, 99), FieldEntry.new(0.9, 99)])
    instance2.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.9, 99)])
    instance3.stub(:get_results).with(anything, anything, anything).and_return([FieldEntry.new(0.1, 11)])
    instance4.stub(:get_results).with(anything, anything, anything).and_return([])
    instance5.stub(:get_results).with(anything, anything, anything).and_return([])

    field = @provider.get_provider_results('A01.0', 10, 'icd_2010_ch')
    field.should==[FieldEntry.new(0.9, 99),
                   FieldEntry.new(0.9, 99),
                   FieldEntry.new(0.9, 99),
                   FieldEntry.new(0.1, 11)]
  end

  it 'should extract fields with code in compounds table' do
    fields = [FieldEntry.new(0.1, 11), FieldEntry.new(0.2, 22), FieldEntry.new(0.3, 33)]
    codes = [11, 22, 44]

    results = @provider.extract_fields_with_code_in(fields, codes)
    results.should==[FieldEntry.new(0.1, 11), FieldEntry.new(0.2, 22)]
  end

  it 'should generate compound fields' do
    fields = [FieldEntry.new(0.5, 11), FieldEntry.new(0.2, 22), FieldEntry.new(0.3, 33)]
    @db.stub(:get_compound_results_components).and_return([{'result'=> 12, 'components' => [11, 22]},
                                                           {'result'=> 23, 'components' => [22, 33]},
                                                           {'result'=> 99, 'components' => [11, 55]}])
    result = @provider.generate_compound_fields(fields)
    result.should==[FieldEntry.new(0.5, 11),
                    FieldEntry.new(0.2, 22),
                    FieldEntry.new(0.3, 33),
                    FieldEntry.new(0.35, 12),
                    FieldEntry.new(0.25, 23)]
  end

  it 'should get fields with folding duplicate fields' do
    @provider.stub(:get_provider_results).with(anything, anything, anything).and_return([FieldEntry.new(0.5, 11),
                                                                                         FieldEntry.new(0.2, 22),
                                                                                         FieldEntry.new(0.3, 33),
                                                                                         FieldEntry.new(0.6, 11),
                                                                                         FieldEntry.new(0.2, 22),
                                                                                         FieldEntry.new(0.3, 77),
                                                                                         FieldEntry.new(0.4, 77)])
    fields = @provider.get_fields('A01.0', 7, 'icd_2010_ch')
    fields.should==[FieldEntry.new(1.0, 11),
                    FieldEntry.new(0.7, 77),
                    FieldEntry.new(0.4, 22),
                    FieldEntry.new(0.3, 33)]
  end
end
