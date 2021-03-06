require_relative '../assert.rb'

# This class gets the results of a specified provider and
# multiplies their provider weights.
# It is used by the compound_info_provider.
class ProviderInstance
  attr_accessor :weight

  # @raise [RuntimeError]
  def initialize (provider_class, weight)
    assert_relatedness(weight)
    @provider_class = provider_class
    @weight = weight
  end

  # @params @see each provider's get_fields method.
  # @return The fields found by this provider for the given code
  # @raise [RuntimeError]
  def get_results(code, max_count, catalog)
    assert_code(code)
    assert_count(max_count)

    # skip provider if relatedness was set to zero or we don't respond to this code type
    return [] unless @weight > 0.0

    tf = @provider_class.get_fields(code, max_count, catalog)
    Rails.logger.info "#{@provider_class} found: "
    Rails.logger.info tf.empty? ? 'nothing' : tf
    return fields_multiply_relatedness(tf, @weight)
  end
end
