# encoding: utf-8
require 'grape'
require_relative '../models/field.rb'

class API < Grape::API
  prefix 'api'
  format :json

  desc 'Returns data'
  resource :fields do
    params do
      requires :code, type: String, desc: 'ICD Code'
      requires :count, type: Integer, desc: 'Number of fields to be displayed'
      requires :lang, type: String, desc: 'The language of the response'
    end

    get 'get/:code/:count/:lang' do
      {
          :input => {:code => params[:code], :count => params[:count], :Lang => params[:lang]},
          :data => '',
          :fields => Field.create('Test', 10, 'B29.2'),
          :type => :ICD,
          :subicds => 'alsdkjfslkdjf'
      }
    end
  end

  desc 'Returns doctors'
  resource :docs do
    get 'hello' do
      {:hello => 'world'}
    end
  end

  desc 'Returns name of field corresponding to a specific code'
  resource :codenames do
    get 'hello' do
      {:hello => 'world'}
    end
  end
end