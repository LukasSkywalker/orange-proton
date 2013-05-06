#encoding: utf-8
require 'spec_helper'

describe ProviderInstance do
  before do
    @provider = CompoundInfoProvider.new
    @db = @provider.db

    @instance1 = ProviderInstance.new(MDCInfoProvider, 0.4)
    @instance2 = ProviderInstance.new(IcdRangeInfoProvider, 0.6)
    @instance3 = ProviderInstance.new(ThesaurInfoProvider, 1)
    @instance4 = ProviderInstance.new(StringmatchInfoProvider, 0.8)
    @instance5 = ProviderInstance.new(ChopRangeInfoProvider, 0.75)
  end

end