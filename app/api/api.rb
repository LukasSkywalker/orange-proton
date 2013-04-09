# This handles the API queries, using the Grape API gem.
class API < Grape::API
  # API specification for grape (url prefixes)
  prefix 'api'
  version 'v1'

  # Return type format. The other possibility is xml.
  format :json

  # The InfoProvider used to return all Query Results
  cattr_accessor :provider
  self.provider = ProviderFactory.get

  # Some handy helpers for the API
  helpers do
    # Some params we always use.
    def lang
      params[:lang]
    end

    # Extract integer values from a string array [val1, val2,...]
    def extract_weight_values(values)
      values = values.gsub('[','').gsub(']','')
      vals = values.split(',')
      vals.map! do |val|
        val.to_i / 100.0
      end
      vals
    end
  end

  # Always rescue ProviderLookupErrors and
  rescue_from ProviderLookupError do |error|
    response = ApiResponse::Error.error_response(error.message, error.language).to_json
    Rack::Response.new(response, 200, { 'Content-type' => 'application/json' }).finish
  end

  # Handles the most important queries:
  # /api/v1/fields/get?code=string&count=integer&lang=string
  desc 'Returns data'
  resource :fields do
    params do
      requires :code, type: String, 
        regexp: /(^\b[A-Z]\d{2}(?:\.\d{1,2})?\b[*+!]?)$|(\d{2}\.\w{0,2}(\.\w{0,2})?)$/,
        desc: 'ICD or CHOP Code'
      requires :count, type: Integer, desc: 'Number of fields to be displayed'
      requires :lang, type: String, regexp: /en\b|de\b|fr\b|it\b/, desc: 'The language of the response'
    end

    get 'get' do
      code = params[:code]
      max_count = params[:count]

      type = API.provider.get_code_type(code)
      icd_data = API.provider.get_icd_or_chop_data(code, lang)
      fields = API.provider.get_fields(code, max_count, lang)

      ApiResponse::Success.field_response(icd_data, fields, type)
    end
  end

  # Handles queries of shape
  # /api/v1/docs/get?long=float&lat=float&field=int&count=int
  desc 'Returns doctors'
  resource :docs do
    params do
      requires :lat, type: Float, desc: 'Latitude of user position'
      requires :long, type: Float, desc: 'Longitude of user position'
      requires :field, type: Integer, desc: 'Code for field of speciality'
      requires :count, type: Integer, desc: 'Maximum numbers of doctors returned'
    end

    get 'get' do
      field_code = params[:field]
      latitude = params[:lat]
      longitude = params[:long]
      max_count = params[:count]

      doctors = API.provider.get_doctors(field_code, latitude, longitude, max_count)
      ApiResponse::Success.response(doctors)
    end
  end

  # Handles queries:
  # /api/v1/codenames/get?code=string&lang=string
  desc 'Returns name of field corresponding to a specific code'
  resource :codenames do
    params do
      requires :code, type: Integer
      requires :lang, type: String
    end

    get 'get' do
      field_code = params[:code]

      field_name = API.provider.get_field_name(field_code, lang)
      ApiResponse::Success.name_response field_name
    end
  end

  # Handles admin queries
  # /api/v1/admin/setWeight=[val1,val2,...]
  desc 'Handles admin queries, such as setting the relatedness bias'
  resource :admin do
    params do
      requires :values, type: String, desc: 'The weight values the frontend sends',
               regexp: /\A\[(((?:[1-9]\d*|0)?(?:\.\d+)?)+,?)*\]\z/
    end

    post 'setWeight' do
      values = extract_weight_values(params[:values])

      API.provider.set_relatedness_weight(values)
    end
  end
end
