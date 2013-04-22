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
        get "/api/v1/fields/get?lang=de&code=#{code}&count=4"

        response.status.should eq(200), "Rejected: #{code} when it should have accepted!"
      end
    end

    it 'should accept these ICD codes' do
      codes = %w(C41.32 B26.3 C62.0 C64)

      codes.each do |code|
        get "/api/v1/fields/get?lang=de&code=#{code}&count=4"

        response.status.should eq(200), "Rejected: #{code} when it should have accepted!"
      end
    end

    it 'should not accept these ICD codes' do
      codes = ['    B26.3', '.3', 'B26.', 'B26,3']

      codes.each do |code|
        get "/api/v1/fields/get?lang=de&code=#{CGI.escape(code)}&count=4"

        response.status.should eq(400), "Accepted: #{code} when it should not have!"
      end
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

  describe 'GET /api/v1/admin/weights/get' do
    it 'should return provider weights' do
      API.provider.stub(:get_relatedness_weight).and_return([0.1, 0.2, 0.3, 0.4, 0.5, 0.6])
      API.provider.should_receive(:get_relatedness_weight).exactly(:once)

      get '/api/v1/admin/weights/get'
      response.status.should == 200
      json_response = JSON.parse(response.body)

      json_response.should eq([10, 20, 30, 40, 50, 60])
    end
  end

  describe 'POST /api/v1/admin/weights/reset' do
    it 'should reset weights and return new weights' do
      API.provider.should_receive(:reset_weights).exactly(:once)
      API.provider.stub(:get_relatedness_weight).and_return([0.1, 0.2, 0.3, 0.4, 0.5, 0.6])

      post '/api/v1/admin/weights/reset'
      response.status.should == 201 #created

      json_response = JSON.parse(response.body)

      json_response.should eq([10, 20, 30, 40, 50, 60])
    end


  end

  describe 'POST /api/v1/admin/weights' do
    it 'should not accept no parameters' do
      post '/api/v1/admin/weights/set'
      response.status.should == 400

      API.provider.should_not_receive(:set_relatedness_weight)
    end

    it 'should not accept false parameters' do
      post '/api/v1/admin/weights/set?values=ljasd'
      response.status.should == 400

      API.provider.should_not_receive(:set_relatedness_weight)
    end

    it 'should not accept array string with square brackets' do
      API.provider.should_not_receive(:set_relatedness_weight)

      post '/api/v1/admin/weights/set?values=[10,20,30,40,50]'
      response.status.should == 400
    end

    it 'should accept array string and set and return new provider weights' do
      API.provider.should_receive(:set_relatedness_weight).
          with([0.1,0.2,0.3,0.4,0.5])
      API.provider.stub(:get_relatedness_weight).and_return([0.1, 0.2, 0.3, 0.4, 0.5, 0.6])

      post '/api/v1/admin/weights/set?values=10,20,30,40,50'
      response.status.should == 201 #created

      json_response = JSON.parse(response.body)

      json_response.should eq([10, 20, 30, 40, 50, 60])
    end

    it 'should ignore additional parameters and return new weights' do
      API.provider.should_receive(:set_relatedness_weight).
          with([0.1,0.2,0.3,0.4,0.5])
      API.provider.stub(:get_relatedness_weight).and_return([0.1, 0.2, 0.3, 0.4, 0.5, 0.6])

      post '/api/v1/admin/weights/set?values=10,20,30,40,50&bla=bla'
      response.status.should == 201

      json_response = JSON.parse(response.body)

      json_response.should eq([10, 20, 30, 40, 50, 60])
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

end
