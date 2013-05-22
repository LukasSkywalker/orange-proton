# @see rescue_from ProviderLookupError in api.rb
class ApiError < StandardError
  attr_reader :http_code

  # @param msg [String] The keyword of the message for this error, e.g. 'unknown_code_type'
  # @param http_code [Integer] The http code of the response that this error should generate, defaults to 410 (gone)
  # @raise [RuntimeError]
  def initialize(msg, http_code = 410)
    assert_kind_of(String, msg)
    assert_kind_of(Integer, http_code)
    super(msg)
    @http_code = http_code
  end
end