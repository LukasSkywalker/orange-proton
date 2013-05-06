#encoding: utf-8
require 'spec_helper'

class ProviderInstance
  attr_accessor :provider_class
end

describe ProviderInstance do
  before do
    @instance1 = ProviderInstance.new(MDCInfoProvider, 0.4)
    @instance2 = ProviderInstance.new(IcdRangeInfoProvider, 0.6)
    @instance3 = ProviderInstance.new(ThesaurInfoProvider, 1)
    @instance4 = ProviderInstance.new(StringmatchInfoProvider, 0.8)
    @instance5 = ProviderInstance.new(ChopRangeInfoProvider, 0.75)
  end

  it 'should return fields with multiplied relatedness' do
    @instance1.provider_class.stub(:get_fields).with(anything, anything, anything).and_return([FieldEntry.new(0.3, 11), FieldEntry.new(0.5, 22)])
    @instance2.provider_class.stub(:get_fields).with(anything, anything, anything).and_return([FieldEntry.new(0.3, 33)])
    @instance3.provider_class.stub(:get_fields).with(anything, anything, anything).and_return([FieldEntry.new(0.4, 44)])
    @instance4.provider_class.stub(:get_fields).with(anything, anything, anything).and_return([FieldEntry.new(0.3, 11)])
    @instance5.provider_class.stub(:get_fields).with(anything, anything, anything).and_return([])

    providers = [@instance1, @instance2, @instance3, @instance4, @instance5]

    fields = []
    providers.each do |p|
      fields << p.get_results('A00.0', 2, 'icd_2012_ch')
    end
    fields.should==[[FieldEntry.new(0.12, 11),
                    FieldEntry.new(0.2, 22)],
                    [FieldEntry.new(0.18, 33)],
                    [FieldEntry.new(0.4, 44)],
                    [FieldEntry.new(0.24, 11)],
                     []]
  end

end