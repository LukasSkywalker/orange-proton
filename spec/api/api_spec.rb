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
      JSON.parse(response.body).first.should include('name',
                                                     'title')
    end
  end
end