require 'grape'
require_relative '../helpers/classify_code'
require_relative '../helpers/information_interface'

class API < Grape::API
  prefix 'api'
  #let rails serve unknown routes templates
  version 'v1', :cascade => false
  format :json

  http_basic do |username, password|
    username == 'usr' && password == 'pwd'
  end

  helpers do
    def lang
      params[:lang]
    end
  end

  desc 'Returns data'
  resource :fields do

    helpers InformationInterface::IcdData

    params do
      requires :code, type: String, regexp: /\b[A-Z]\d{2}(?:\.\d{1,2})?\b[*+!]?/, desc: 'ICD Code'
      requires :count, type: Integer, desc: 'Number of fields to be displayed'
      requires :lang, type: String, regexp: /en\b|de\b|fr\b|it\b/, desc: 'The language of the response'
    end

    get 'get' do
      {
          :data => get_icd_data(params[:code], lang),
          :fields => get_fields_of_specialization(params[:code], params[:count], lang),
          :type => get_code_type(params[:code]),
      }
    end
  end

  desc 'Returns doctors'
  resource :docs do

    helpers InformationInterface::Doctors

    params do
      requires :lat, type: Float, desc: 'Latitude of user position'
      requires :long, type: Float, desc: 'Longitude of user position'
      requires :field, type: Integer, desc: 'Code for field of speciality'
      requires :count, type: Integer, desc: 'Maximum numbers of doctors returned'
    end

    get 'get' do
      get_close_doctors(params[:field], params[:lat], params[:long], params[:count])
    end
  end

  desc 'Returns name of field corresponding to a specific code'
  resource :codenames do

    helpers InformationInterface::Helpers

    params do
      requires :code, type: String
      requires :lang, type: String
    end

    get  do
      get_name_of_field(params[:code], params[:lang])
    end
  end
end