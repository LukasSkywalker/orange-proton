require 'spec_helper'

describe BaseInformationProvider do
  before do
    @provider = BaseInformationProvider.new
  end

  it 'should raise errors if unimplemented methods are called' do
    expect {@provider.get_fields('code', 0, 'language')}.to raise_error(NotImplementedError)
  end
end
