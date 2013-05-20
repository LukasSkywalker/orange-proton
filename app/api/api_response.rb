# This formats responses and errors as required by our api standard.
module ApiResponse
  # Successful queries
  module ApiResponse::Success
    class << self

      # Generic success response formatter.
      def response(data = '')
        assert_kind_of(Hash, data) unless data.kind_of?(String) || data.kind_of?(Array)
        {
          :status => 'ok',
          :result => data
        }
      end

      # @param data [Hash] The raw db entry to the code.
      # @param type [Identifier] The type of code. :icd or :chop
      # @param fields [Array] An array of {FieldEntry}s.
      # @param is_fallback [Boolean] Whether the language is not the requested language.
      # @raise [RuntimeError]
      def field_response(data, fields, type, language, is_fallback)
        assert_kind_of(Hash, data)
        assert_fields_array(fields)
        assert_language(language)
        assert_boolean(is_fallback)
        assert(type == :chop || type == :icd) # a successful response never returns an :unknown codetype
        response({
          :data => data,
          :fields => format_fields(fields),
          :type => type,
          :language => language, 
          :is_fallback => is_fallback
        })
      end

      private
      # @param fields [Array] An array of {FieldEntry}s.
      # @raise [RuntimeError]
      def format_fields(fields)
        assert_fields_array(fields)
        fields.map { |field| # Convert from FieldEntry object to hash.
          {
            :name => field.name,
            :relatedness => field.relatedness,
            :field => field.code,
            :fallbacks => field.fallbacks
          }
        }
      end
    end
  end

  # Errors
  module ApiResponse::Error
    class << self
      # @param error_code [String] e.g. 'unknown_code_type'
      # @param language [String] "de", "en", "fr", "it"
      # @raise [RuntimeError]
      def error_response(error_code, language)
        assert_language(language)
        assert_kind_of(String, error_code)
        {
          :status => 'error',
          # I18n is our localisation framework  - the translations are in config/locales/*.yml
          :message => I18n.t(error_code, :locale => language)
        }
      end
    end
  end

end
