# This handles the API queries, using the Grape API gem.
class API < Grape::API
  include ApiResponse

  # API specification for grape (url prefixes)
  prefix 'api'
  version 'v1'

  # Return type format. The other possibility is xml.
  format :json

  # The InfoProvider used to return all Query Results
  cattr_accessor :doctor_locator
  cattr_accessor :provider
  self.provider       = ObjectFactory.get_information_provider
  self.doctor_locator = ObjectFactory.get_doctor_locator

  # Some handy helpers for the API
  helpers do
    # Some params we always use.
    def lang
      params[:lang]
    end
  end

  # Always rescue ProviderLookupErrors
  rescue_from ProviderLookupError do |error|
    response = Error.error_response(error.message, error.language).to_json
    Rack::Response.new(response, 200, 
                       { 'Content-type' => 'application/json' }).finish
  end

  # Handles the most important queries:
  # /api/v1/fields/get?code=string&count=integer&lang=string
  desc 'Returns data'
  resource :fields do
    params do
      requires :code, type: String, 
        regexp: /(^[A-Z]\d{2}(?:\.\d{1,2})?[*+!]?$)|(^[A-Z]?(\d{2}(\.\w{2})?(\.\w{1,2})?)$)/,
        desc: 'ICD or CHOP Code'
      requires :count, type: Integer,
        desc: 'Number of fields to be displayed'
      requires :lang, type: String, regexp: /en\b|de\b|fr\b|it\b/,
        desc: 'The language of the response'
    end

    get 'get' do
      code      = params[:code]

      max_count = params[:count]
      assert_count(max_count) # don't allow excessive queries
      # TODO This should be handled with an api error returned to the client
      # instead.

      type     = get_code_type(code)
      icd_data = API.provider.get_icd_or_chop_data(code, lang)
      assert_kind_of(Hash, icd_data)
      fields   = API.provider.get_fields(code, max_count, lang)
      assert_fields_array(fields)
      assert(fields.length <= max_count)

      Success.field_response(icd_data, fields, type)
    end
  end

  # Handles queries of shape
  # /api/v1/docs/get?long=float&lat=float&field=int&count=int
  desc 'Returns doctors'
  resource :docs do
    params do
      requires :lat, type: Float, 
        desc: 'Latitude of user position'
      requires :long, type: Float,
        desc: 'Longitude of user position'
      requires :field, type: Integer, 
        desc: 'Code for field of speciality'
      requires :count, type: Integer, 
        desc: 'Maximum numbers of doctors returned'
    end

    get 'get' do
      field_code = params[:field]
      latitude   = params[:lat]
      longitude  = params[:long]
      max_count  = params[:count]
      assert_count(max_count) # don't allow excessive queries
      # TODO This should be handled with an api error returned to the client
      # instead.

      doctors = API.doctor_locator.find_doctors(field_code, latitude, 
                                                longitude, max_count)
      assert(doctors.length <= max_count)

      Success.response(doctors)
    end
  end

  # Handles admin queries
  # /api/v2/admin/setWeight=[val1,val2,...]
  # TODO This is not needed in the final version...
  desc 'Handles admin queries, such as setting the relatedness bias'
  resource :admin do
    namespace :weights do

      helpers do
        # Extract integer values from a string array [val1, val2,...]
        def extract_weight_values(values)
          vals = values.split(',')
          vals.map! do |val|
            val.to_i / 100.0
          end
          vals
        end

        def encode_weight_values
          weights = API.provider.get_relatedness_weight
          weights.map! do |val|
            Integer(val * 100)
          end
          weights
        end
      end

      desc 'Return provider weights'
      get 'get' do
        encode_weight_values
      end

      desc 'Reset weights to default values'
      post 'reset' do
        API.provider.reset_weights
        encode_weight_values
      end

      params do
        requires :values, type: String, desc: 'The weight values the frontend sends',
          regexp: /\A(((?:[1-9]\d*|0)?(?:\.\d+)?)+,?)*\z/
      end

      post 'set' do
        values = extract_weight_values(params[:values])
        API.provider.set_relatedness_weight(values)
        encode_weight_values
      end
    end
  end
end
