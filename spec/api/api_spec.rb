require 'spec_helper'

class DatabaseInfoProvider
  attr_reader :db   # we need to be able to access this in order to stub it.
end

class API
  cattr_accessor :doctor_locator
  cattr_accessor :provider
  cattr_accessor :localised_data_provider
end

RSpec::Matchers.define :be_standard_api_response do
  match do |r|
    r.include?('status' => 'ok')
    r.has_key?('result')
    r['result'] != nil
  end
end

RSpec::Matchers.define :be_error_api_response do
  match do |r|
    r.include?('status' => 'error')
    r.has_key?('message')
    r['message'] != nil
  end
end

describe API do
  # Get fields queries tests
  describe 'GET /api/v1/fields/get' do
    it 'should respond with bad request if no parameters are sent' do
      get '/api/v1/fields/get'
      response.status.should == 400
    end

    it 'should respond with bad request if not all required parameters are sent' do
      get '/api/v1/fields/get?code=B26'
      response.status.should == 400
    end

    it 'should accept these CHOP codes' do
      codes = %w(Z55.69.0)

      codes.each do |code|
        get "/api/v1/fields/get?lang=de&code=#{code}&count=4&catalog=chop_2013_ch"

        response.status.should eq(200), "Rejected: #{code} when it should have accepted!"
      end
    end

    it 'should accept these ICD codes' do
      codes = %w(C41.32 B26.3 C62.0 C64)

      codes.each do |code|
        get "/api/v1/fields/get?lang=de&code=#{code}&count=4&catalog=icd_2012_ch"

        response.status.should eq(200), "Rejected: #{code} when it should have accepted!"
      end
    end

    it 'should not accept these ICD codes' do
      codes = ['    B26.3', '.3', 'B26.', 'B26,3']

      codes.each do |code|
        get "/api/v1/fields/get?lang=de&code=#{CGI.escape(code)}&count=4&catalog=icd_2012_ch"

        response.status.should eq(400), "Accepted: #{code} when it should not have!"
      end
    end

    it 'should raise error if type of request and catalog is not the same for icd' do
      get '/api/v1/fields/get?lang=de&code=00&count=4&catalog=icd_2012_ch'

      json_response = JSON.parse(response.body)
      json_response.should be_error_api_response
    end

    it 'should raise error if type of request and catalog is not the same for chop' do
      get '/api/v1/fields/get?lang=de&code=A00.0&count=4&catalog=chop_2012_ch'

      json_response = JSON.parse(response.body)
      json_response.should be_error_api_response
    end

    it 'should raise error if type of request and catalog is not the same for an unknown code' do
      get '/api/v1/fields/get?lang=de&code=002.y&count=4&catalog=icd_2012_ch'
      response.status.should == 400
    end

    it 'should respond with bad request if not all required parameters are sent' do
      get '/api/v1/fields/get?code=B26'
      response.status.should == 400
    end

    it 'should respond with hash if required parameters are sent' do
      API.localised_data_provider.should_receive(:get_icd_or_chop_data).with('B26.3', 'de', 'icd_2012_ch').and_call_original
      API.provider.should_receive(:get_fields).with('B26.3', 4, 'icd_2012_ch').and_call_original

      get '/api/v1/fields/get?lang=de&code=B26.3&count=4&catalog=icd_2012_ch'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should be_standard_api_response

      result = json_response['result']
      result.should include('data','fields','type')
    end

    it 'should return error response if field code does not exist' do
      API.localised_data_provider.stub(:get_icd_or_chop_data) {raise ProviderLookupError.new('no_icd_chop_data', 'de')}
      API.localised_data_provider.should_receive(:get_icd_or_chop_data).
          with('B26.3', 'de', 'icd_2012_ch')

      get '/api/v1/fields/get?lang=de&code=B26.3&count=4&catalog=icd_2012_ch'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should be_error_api_response
    end
  end

  # Get docs queries tests
  describe 'GET /api/v1/docs/get' do
    it 'should respond with bad request if no parameters are sent' do
      get 'api/v1/docs/get'
      response.status.should == 400
    end

    it 'should respond with bad request if not all required parameters are sent' do
      get 'api/v1/docs/get?lat=47.0&long=8.0'
      response.status.should == 400
    end

    it 'should respond with doctor hash if required parameters are sent' do
      get 'api/v1/docs/get?lat=47.0&long=8.0&field=13&count=4'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should be_standard_api_response

      doctors = json_response['result']
      doctors.first.should include('name', 'title', 'address')
    end
  end

end
