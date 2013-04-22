# This formats responses and errors as required by our api standard.
module ApiResponse
  # Successful queries
  module ApiResponse::Success
    class << self
      def response(data = '')
        {
          :status => 'ok',
          :result => data
        }
      end

      def field_response(icd_data, fields, type)
        assert_fields_array(fields)
        assert(type == :chop || type == :icd) # a successful response never returns :unknown
        response({
          :data => icd_data,
          :fields => format_fields(fields),
          :type => type
        })
      end

      private
      def format_fields(fields)
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
        {
          :status => 'error',
          :message => I18n.t(error_code, :locale => language)
        }
      end
    end
  end

end
