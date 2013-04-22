# This is used to throw the well defined errors that will be shown to the frontend
class ProviderLookupError < StandardError
  attr_accessor :language

  def initialize(msg, language)
    assert_kind_of(String, msg)
    super(msg)
    assert_language(language)
    self.language = language
  end
end
