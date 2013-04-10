require 'spec_helper'

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
  describe 'GET /api/v1/fields/get' do
    it 'should respond with bad request if no parameters are sent' do
      get '/api/v1/fields/get'
      response.status.should == 400
    end

    it 'should respond with bad request if not all required parameters are sent' do
      get '/api/v1/fields/get?code=B26'
      response.status.should == 400
    end

    it 'should respond with hash if required parameters are sent' do
      API.provider.should_receive(:get_code_type).with('B26.3').and_call_original
      API.provider.should_receive(:get_icd_or_chop_data).with('B26.3', 'de').and_call_original
      API.provider.should_receive(:get_fields).with('B26.3', 4, 'de').and_call_original

      get '/api/v1/fields/get?lang=de&code=B26.3&count=4'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should be_standard_api_response

      result = json_response['result']
      result.should include('data','fields','type')
    end

    it 'should return error response if field code does not exist' do
      API.provider.stub(:get_icd_or_chop_data) {raise ProviderLookupError.new('no_icd_chop_data', 'de')}
      API.provider.should_receive(:get_icd_or_chop_data).
          with('B26.3', 'de')

      get '/api/v1/fields/get?lang=de&code=B26.3&count=4'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should be_error_api_response
    end
  end

  describe 'POST /api/v1/admin/setWeight' do
    it 'should not accept no parameters' do
      post '/api/v1/admin/setWeight'
      response.status.should == 400

      API.provider.should_not_receive(:set_relatedness_weight)
    end

    it 'should not accept false parameters' do
      post '/api/v1/admin/setWeight?values=ljasd'
      response.status.should == 400

      API.provider.should_not_receive(:set_relatedness_weight)
    end

    it 'should not accept array string with square brackets' do
      API.provider.should_not_receive(:set_relatedness_weight)

      post '/api/v1/admin/setWeight?values=[10,20,30,40,50]'
      response.status.should == 400
    end

    it 'should accept array string and set provider weights' do
      API.provider.should_receive(:set_relatedness_weight).
          with([0.1,0.2,0.3,0.4,0.5])

      post '/api/v1/admin/setWeight?values=10,20,30,40,50'
      response.status.should == 201 #created
    end

    it 'should ignore additional parameters' do
      API.provider.should_receive(:set_relatedness_weight).
          with([0.1,0.2,0.3,0.4,0.5])

      post '/api/v1/admin/setWeight?values=10,20,30,40,50&bla=bla'
      response.status.should == 201
    end
  end

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

  describe 'GET /api/v1/codenames/get' do
    it 'should respond with bad request if no parameters are sent' do
      get '/api/v1/codenames/get'
      response.status.should == 400
    end

    it 'should respond with bad request if not all required parameters are sent' do
      get '/api/v1/codenames/get?code=7'
      response.status.should == 400
    end

    it 'should respond with doctor hash if required parameters are sent' do
      get '/api/v1/codenames/get?code=7&lang=de'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should be_standard_api_response

      name = json_response['result']
      name.should include('name' => 'Allgemeine Medizin')
    end

    it 'should return error response if field code does not exist' do
      API.provider.stub(:get_field_name) {raise ProviderLookupError.new('unknown_fs_code', 'de')}
      API.provider.should_receive(:get_field_name).with(7,'de')

      get '/api/v1/codenames/get?code=7&lang=de'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should be_error_api_response
    end
  end
end