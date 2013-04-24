# This formats responses and errors as required by our api standard.
module ApiResponse
  # Successful queries
  module ApiResponse::Success
    class << self
      def response(data = '')
        assert_kind_of(Hash, data) unless data.kind_of?(String) || data.kind_of?(Array)
        {
          :status => 'ok',
          :result => data
        }
      end

      def field_response(icd_data, fields, type, language, is_fallback)
        assert_fields_array(fields)
        assert_language(language)
        assert_boolean(is_fallback)
        assert(type == :chop || type == :icd) # a successful response never returns :unknown
        response({
          :data => icd_data,
          :fields => format_fields(fields),
          :type => type,
          :language => language, 
          :is_fallback => is_fallback
        })
      end

      private
      def format_fields(fields)
        assert_fields_array(fields)
        fields.map { |field| # Convert from FieldEntry object to hash.
          {
            :name => field.name,
            :relatedness => field.relatedness,
            :field => field.code
          }
        }
      end
    end
  end

  # Errors
  module ApiResponse::Error
    class << self
      def error_response(error_code, language)
        assert_language(language)
        {
          :status => 'error',
          # I18n is our localisation framework
          :message => I18n.t(error_code, :locale => language)
        }
      end
    end
  end

end
