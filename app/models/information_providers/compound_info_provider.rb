require_relative '../assert.rb'

# Combines other information providers and weights the relatedness of
# the fields the return with globally configurable values.
class CompoundInfoProvider < DatabaseInfoProvider

  def initialize
    super

    # the providers get instantiated in a separate class (ProviderInstance)
    # The order of these is important in Developemnt mode (the admin panel assumes it to be like this)
    @providers = [
      ProviderInstance.new(MDCInfoProvider.new,         0.4),
      ProviderInstance.new(IcdRangeInfoProvider.new,    0.6),
      ProviderInstance.new(ThesaurInfoProvider.new,     1),
      ProviderInstance.new(StringmatchInfoProvider.new, 0.8),
      ProviderInstance.new(ChopRangeInfoProvider.new,   0.75)
    ]
  end

  # @see DatabaseAdapter#get_fields
  # @raise [RuntimeError]
  def get_fields(code, max_count, catalog)
    assert_code(code)
    assert_count(max_count)
    @db.assert_catalog(catalog)

    # Let all information providers return their results into fields
    fields = get_provider_results(code, max_count, catalog)

    fields = fold_duplicate_fields(fields) # we want generate compounds to operate on single copies of everything

    fields = generate_compound_fields(fields) # implements #171

    fields = fold_duplicate_fields(fields) # the above might have created more duplicated

    fields.sort! do |x, y|
      y.relatedness <=> x.relatedness
    end

    fields[0..max_count-1]
  end

  private  
  # @param fields a list of fields in the API format (FieldEntry) (with relatedness and code)
  # @param codes an array of fs_codes (2 - 210)
  # @return The same list of fields but with those removed that have a code not in codes
  # @raise [RuntimeError]
  def extract_fields_with_code_in(fields, codes) 
    assert_fields_array(fields)
    assert_field_code(codes[0]) if codes.length > 0

    fields = fields.dup # copy
    fields.delete_if {|f| !codes.include?(f.code)}
    fields
  end

  # @param fields a list of fields in the API format (FieldEntry) (with relatedness and code )
  # @return The same list of fields plus all compounds that can be generated from it.
  # @raise [RuntimeError]
  def generate_compound_fields(fields)
    assert_fields_array(fields)

    # Confirmed working with chop code 00.01  (combines 27 and 101 to 108 (nerven + radio => neuroradio))

    Rails.logger.info "generate compounds for fields #{fields}"
    codes = fields.map {|f| f.code}
    Rails.logger.info "codes are: #{codes}"

    rcs = @db.get_compound_results_components
    Rails.logger.info "compound table is #{rcs}"

    rcs.each {|rc|
      if is_subset?(rc['components'], codes)
        Rails.logger.info "rc #{rc} is entirely contained"
        fs = extract_fields_with_code_in(fields, rc['components'])

        # calculate avg relatedness
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

  # @param code [String] An ICD or CHOP code
  # @param max_count [Integer] The maximum amount of results
  # @param catalog [String] The catalog to look in
  # @return A list of all results from the providers in @providers
  # @raise [RuntimeError]
  def get_provider_results(code, max_count, catalog)
    fields = []
    @providers.each do |provider|
      fields.concat(provider.get_results(code, max_count, catalog))
    end
    fields
  end

  # Development only
  public
    # Handle
    # /api/v1/admin/set/ queries
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
