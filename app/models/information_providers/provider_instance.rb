require_relative '../assert.rb'

class ProviderInstance
  attr_reader :weight

  def initialize (provider_instance, weight)
    assert_relatedness(weight)
    @provider_instance = provider_instance
    @weight = weight
  end

  # @return The fields found by this provider for the given code
  def get_results(code, max_count, catalog)
    assert_code(code)
    assert_count(max_count)

    # skip provider if relatedness was set to zero or we don't respond to this code type
    return [] unless @weight > 0.0

    tf = @provider_instance.get_fields(code, max_count, catalog)
    Rails.logger.info "#{@provider_instance} found: "
    Rails.logger.info tf.empty? ? 'nothing' : tf
    return fields_multiply_relatedness(tf, @weight)
  end
end