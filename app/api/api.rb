# This handles the API queries, using the Grape API gem.
class API < Grape::API
  # API specification for grape (url prefixes)
  prefix 'api'
  version 'v1'

  # Return type format. The other possibility is xml.
  format :json

  # Some params we always use.
  helpers do
    def lang
      params[:lang]
    end
  end

  # Handles the most important queries:
  # /api/v1/fields/get?code=string&count=integer&lang=string
  desc 'Returns data'
  resource :fields do

    helpers InformationInterface::IcdData

    params do
      requires :code, type: String, regexp: /\b[A-Z]\d{2}(?:\.\d{1,2})?\b[*+!]?/, desc: 'ICD Code'
      requires :count, type: Integer, desc: 'Number of fields to be displayed'
      requires :lang, type: String, regexp: /en\b|de\b|fr\b|it\b/, desc: 'The language of the response'
    end

    get 'get' do
      get_fields(params[:code], params[:count], lang)
    end
  end

  # Handles queries of shape
  # /api/v1/docs/get?long=float&lat=float&field=int&count=int
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
      get_doctors(params[:field], params[:lat], params[:long], params[:count])
    end
  end

  # Handles queries:
  # /api/v1/codenames/get?code=string&lang=string
  desc 'Returns name of field corresponding to a specific code'
  resource :codenames do

    helpers InformationInterface::Helpers

    params do
      requires :code, type: Integer
      requires :lang, type: String
    end

    get 'get'  do
      get_field_name(params[:code], params[:lang])
    end
  end

  # Handles admin queries
  # /api/v1/admin/set??? (values?)
  # TODO Document!
  resource :admin do
    helpers InformationInterface::Admin

    params do
      requires :values, type: String
    end

    post 'set' do
      set_relatedness(params[:values])
    end
  end
  
end
