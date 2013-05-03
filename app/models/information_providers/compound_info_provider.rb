# rails doesn't want to load this before an instance is created so we need to include it explicitly here...
require_relative '../assert.rb'

# Combines other information providers and weights the relatedness of
# the fields the return with globally configurable values.
class CompoundInfoProvider < DatabaseInfoProvider
  private # does this work for inner classes?
  class ProviderInstance
    # TODO This can still be manually changed to a non-relatedness...
    attr_accessor :weight # not attr_accesor weight, this needs to be an identifier

    def initialize (provider_instance, weight)
      assert_relatedness(weight)
      @provider_instance = provider_instance
      @weight = @default_weight = weight
    end

    def reset_weight
      @weight = @default_weight
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

  public
  def initialize
    super

    # the order of the elements in this array is important, 
    # only because the admin panel (
    # TODO: REMOVE) sends the weights expecting this order!
    @providers = [
      ProviderInstance.new(MDCInfoProvider.new,         0.4),
      ProviderInstance.new(IcdRangeInfoProvider.new,    0.6),
      ProviderInstance.new(ThesaurInfoProvider.new,     1),
      ProviderInstance.new(StringmatchInfoProvider.new, 0.8),
      ProviderInstance.new(ChopRangeInfoProvider.new,   0.75)
    ]
  end

  def get_fields(code, max_count, catalog)
    assert_code(code)
    assert_count(max_count)
    @db.assert_catalog(catalog)

    # Let all information providers return their results into fields
    fields = get_provider_results(code, max_count, catalog)

    fields = fold_duplicate_fields fields # we want generate compounds to operate on single copies of everything

    fields = generate_compound_fields(fields) # implements #171

    fields = fold_duplicate_fields fields # the above might have created more duplicated

    fields.sort! do |x, y|
      y.relatedness <=> x.relatedness
    end

    fields[0..max_count-1]
  end

  private  
  # @param fields a list of fields in the API format (FieldEntry) (with relatedness and code )
  # @param codes an array of fs_codes (2 - 210)
  # @return The same list of fields but with those removed that have a code not in codes
  def extract_fields_with_code_in(fields, codes) 
    assert_fields_array(fields)
    assert_field_code(codes[0]) if codes.length > 0

    fields = fields.dup # copy
    fields.delete_if {|f| !codes.include?(f.code)}
    fields
  end

  # @param fields a list of fields in the API format (FieldEntry) (with relatedness and code )
  # @return The same list of fields plus all compounds that can be generated from it.
  # Implements #
  def generate_compound_fields(fields)
    assert_fields_array(fields)

    # Confirmed working with chop code 00.01  (combines 27 and 101 to 108 (nerven + radio => neuroradio))

    Rails.logger.info "generate compounds for fields #{fields}"
    codes = fields.map {|f| f.code}
    Rails.logger.info "codes are: #{codes}"

    rcs =@db.get_compound_results_components
    Rails.logger.info "compound table is #{rcs}"

    rcs.each {|rc|
      if is_subset?(rc['components'], codes)
        Rails.logger.info "rc #{rc} is entirely contained"
        fs = extract_fields_with_code_in(fields, rc['components'])
        rmean = 0
        fs.each {|f| rmean += f.relatedness}
        assert(fs.size > 0)
        rmean /= fs.size
        assert_relatedness(rmean)
        Rails.logger.info "components: #{fs}, mean #{rmean}"
        fields << fs_code_to_field_entry(rc['result'], rmean)
      end
    }
    fields
  end

  def get_provider_results(code, max_count, catalog)
    fields = []
    @providers.each do |provider|
      fields.concat(provider.get_results(code, max_count, catalog))
    end
    fields
  end
  
  # TODO remove for final version:
  public
  # Handle
  # /api/v1/admin/set??? (values?)
  # Assign new weights to each info provider. Values is a simple list (?).
  def set_relatedness_weight(vals)
    @providers.each_with_index do |provider, index|
       provider.weight = vals[index] if vals[index]
    end
  end

  def get_relatedness_weight
    @providers.map {|provider| provider.weight}
  end

  def reset_weights
    @providers.each do |provider|
       provider.reset_weight
    end
  end
end
