module ApiResponse
  module ApiResponse::Success
    class << self
      def response(data = '')
        {
            :status => 'ok',
            :result => data
        }
      end

      def field_response(icd_data, fields, type)
        response({
            :data => icd_data,
            :fields => format_fields(fields),
            :type => type
        })

      end

      def name_response(field_name)
        response({
            :name => field_name
        })
      end

      private
      def format_fields(fields)
        out = []
        fields.each do |field|
          out << {
              :name => field.name,
              :relatedness => field.relatedness,
              :field => field.code
          }
        end
        out
      end
    end
  end

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