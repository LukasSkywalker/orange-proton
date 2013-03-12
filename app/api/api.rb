require 'grape'
require_relative '../models/field'
require_relative '../models/doctor'
require_relative '../helpers/classify_code'

class API < Grape::API
  prefix 'api'
  version 'v1'
  format :json

  http_basic do |username, password|
    username == 'usr' && password == 'pwd'
  end

  desc 'Returns data'
  resource :fields do

    params do
      requires :code, type: String, regexp: /\b[A-Z]\d{2}(?:\.\d{1,2})?\b[*+!]?/, desc: 'ICD Code'
      requires :count, type: Integer, desc: 'Number of fields to be displayed'
      requires :lang, type: String, regexp: /en\b|de\b|fr\b|it\b/, desc: 'The language of the response'
    end

    get 'get' do
      {
          :data => {:empty => 'hash'},
          :fields => [
              Field.create('TestField1', 0.8, 'B29.2'),
              Field.create('TestField2', 0.5, 'B29.2'),
              Field.create('TestField3', 0.2, 'B29.2')
          ],
          :type => get_code_type(params[:code]),
          :subicds => [{:empty => 'hash'}]
      }
    end
  end

  desc 'Returns doctors'
  resource :docs do

    params do
      requires :lat, type: Float, desc: 'Latitude of user position'
      requires :long, type: Float, desc: 'Longitude of user position'
      requires :field, type: Integer, desc: 'Code for field of speciality'
    end

    get 'get' do
      [Doctor.create('Hans Wurst',
                    'Dr. med. Arzt fuer Innere Medizin',
                    'Entenstrasse 23, 8302 Entenhausen',
                    'doc@docmail.ch',
                    '031 791 10 10',
                    '031 791 10 11',
                    'BE',
                    'Internisten'
      )]
    end
  end

  desc 'Returns name of field corresponding to a specific code'
  resource :codenames do

    params do
      requires :code, type: String
      requires :lang, type: String
    end

    get 'hello' do
      {:hello => 'world'}
    end
  end
end