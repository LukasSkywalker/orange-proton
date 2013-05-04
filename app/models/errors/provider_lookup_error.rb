# This is used to throw the well defined errors that will be shown to the frontend.
# They are translated to api_response errors in the api
# @see rescue_from ProviderLookupError in api.rb
class ProviderLookupError < StandardError
  attr_reader :language

  # @param language [String] "de", "en", "fr", "it"
  # @param msg [String] The keyword of the message for this error, e.g. 'unknown_code_type'
  def initialize(msg, language)
    assert_kind_of(String, msg)
    super(msg)
    assert_language(language)
    @language = language
  end
end
