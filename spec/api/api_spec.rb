require 'spec_helper'

describe API do
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
      json_response.should include('status' => 'ok')
      json_response.should include('data')

      doctors = json_response['data']
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
      json_response.should include('status' => 'ok')
      json_response.should include('data')

      name = json_response['data']
      name.should include('name' => 'Allgemeine Medizin')
    end

    it 'should return error response if field code does not exist' do
      API.provider.stub(:get_field_name) {raise ProviderLookupError.new('unknown_fs_code', 'de')}
      get '/api/v1/codenames/get?code=7&lang=de'

      response.status.should == 200
      json_response = JSON.parse(response.body)
      json_response.should include('status' => 'error')
      json_response.should include('message')
    end
  end
end