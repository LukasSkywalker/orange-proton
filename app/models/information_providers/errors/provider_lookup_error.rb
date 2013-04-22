class ProviderLookupError < StandardError
  attr_accessor :language

  def initialize(msg, language)
    super(msg)
    self.language = language
  end
end