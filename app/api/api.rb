# This handles the queries (/api/v1/...), using the Grape gem.
class API < Grape::API
  # Externalised formatting of the response.
  include ApiResponse

  # specification for grape (url prefixes)
  prefix 'api'
  version 'v1'

  # Return type format. The other possibility is xml.
  format :json

  # The objects used for fetching the results
  @@provider                = ObjectFactory.get_information_provider
  @@doctor_locator          = ObjectFactory.get_doctor_locator
  @@localised_data_provider = ObjectFactory.get_localised_data_provider

  # Some handy helpers for the API
  helpers do
    # Some params we always use.
    def lang; params[:lang] end

    def compare_type(catalog, type)
      catalog = catalog.split('_')[0].to_sym

      if type == :unknown
        raise ProviderLookupError.new('no_icd_chop_data', lang)
      elsif catalog == :chop and type != :chop
        raise ProviderLookupError.new('request_not_chop_type', lang)
      elsif catalog == :icd and type != :icd
        raise ProviderLookupError.new('request_not_icd_type', lang)
      end
    end
  end

  # Always rescue ProviderLookupErrors
  rescue_from ProviderLookupError do |error|
    response = Error.error_response(error.message, error.language).to_json
    Rack::Response.new(response, 200, 
                       { 'Content-type' => 'application/json' }).finish
  end

  # Handles the most important queries:
  # /api/v1/fields/get?code=string&count=integer&lang=string&catalog=...
  desc 'Returns data'
  resource :fields do
    # When these regexes do not match, Grape returns a json object containing an error such as
    # "error" : "illegal parameter: code" or "error" : "missing parameter: catalog"
    params do
      requires :code, type: String, 
        regexp: /(^[A-Z]\d{2}(?:\.\d{1,2})?[*+!]?$)|(^[A-Z]?(\d{2}(\.\w{2})?(\.\w{1,2})?)$)/,
        desc: 'ICD or CHOP Code'
      requires :count, type: Integer,
        desc: 'Number of fields to be displayed'
      requires :lang, type: String, regexp: /en\b|de\b|fr\b|it\b/,
        desc: 'The language of the response'
      requires :catalog, type: String, 
        regexp: /chop_2012_ch\b|chop_2013_ch\b|icd_2010_ch\b|icd_2012_ch\b/,
        desc: 'The catalog the code is to be searched in'
    end

    # @raise [RuntimeError, ProviderLookupError]
    get 'get' do
      code      = params[:code]
      catalog   = params[:catalog]
      max_count = params[:count]
      assert_count(max_count) # Exceptions raised in these are returned as "Internal Server Error" since it's really
      # our fault if these fail.

      type = get_code_type(code)
      # the regex should not differ from the regex used to check this,
      # so this method should detect a code type as well
      assert(type != :unknown) 

      # raises an error if type of code request does not match catalog (icd/chop)
      compare_type(catalog, type)

      # Get data
      r = @@localised_data_provider.get_icd_or_chop_data(code,
                                                           lang,
                                                           catalog)
      data = r[:data]
      assert_kind_of(Hash, data)
      # data might not have been available and we had to fall back to another 
      # language
      data_language = r[:language] 
      assert_language(data_language)

      # Get fields
      fields = @@provider.get_fields(code, max_count, catalog)
      assert_fields_array(fields)
      assert(fields.length <= max_count)

      # we can always localise the field names to the requested language
      @@localised_data_provider.localise_field_entries(fields, lang)

      Success.field_response(data,
                             fields, 
                             type, 
                             data_language,
                             data_language != lang # whether we had to fall back 
                            )
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

    # @raise [RuntimeError]
    get 'get' do
      field_code = params[:field]
      latitude   = params[:lat]
      longitude  = params[:long]
      max_count  = params[:count]
      assert_count(max_count) # don't allow excessive queries

      doctors =  @@doctor_locator.find_doctors(field_code, latitude,
                                                longitude, max_count)
      assert_kind_of(Array, doctors)
      assert(doctors.length <= max_count)
      assert_kind_of(Hash, doctors[0]) if doctors.length > 0

      Success.response(doctors)
    end
  end

  # Handles admin queries
    # /api/v2/admin/setWeight=[val1,val2,...]
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
            weights = @@provider.get_relatedness_weight
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
        if Rails.env == 'development' or Rails.env == 'development-remote'
          @@provider.reset_weights
          encode_weight_values
        end
      end

      params do
        requires :values, type: String, desc: 'The weight values the frontend sends',
              regexp: /\A(((?:[1-9]\d*|0)?(?:\.\d+)?)+,?)*\z/
      end

      post 'set' do
        if Rails.env == 'development' or Rails.env == 'development-remote'
          values = extract_weight_values(params[:values])
          @@provider.set_relatedness_weight(values)
          encode_weight_values
        end
      end
    end
  end
end
