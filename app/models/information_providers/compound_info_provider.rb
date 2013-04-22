# Speed things up a little bit.
require 'parallel_each'

# Combines other information providers and weights the relatedness of
# the fields the return with globally configurable values.
class CompoundInfoProvider < DatabaseInfoProvider
  # default weights for prodiers
  @@default_weights = [0.4, 0.6, 1, 0.8, 0.75] # TODO this seems to have an arbitrary yet important order...

  # provider pool
  @@providers = {
      MDCInfoProvider => MDCInfoProvider.new,
      IcdRangeInfoProvider => IcdRangeInfoProvider.new,
      ThesaurInfoProvider => ThesaurInfoProvider.new,
      StringmatchInfoProvider => StringmatchInfoProvider.new,
      ChopRangeInfoProvider => ChopRangeInfoProvider.new
  }

  def initialize
    super
    # weights for each provider
    @weights = {
        MDCInfoProvider => @@default_weights[0],
        IcdRangeInfoProvider => @@default_weights[1],
        ThesaurInfoProvider => @@default_weights[2],
        StringmatchInfoProvider => @@default_weights[3],
        ChopRangeInfoProvider => @@default_weights[4]
    }

    @components = {
        :icd => [MDCInfoProvider, IcdRangeInfoProvider,ThesaurInfoProvider, StringmatchInfoProvider],
        :chop => [ChopRangeInfoProvider, MDCInfoProvider]
    }

  end

  def get_fields(code, max_count, language)
    # Let all information providers return their results into fields
    fields = get_provider_results(@components[get_code_type(code)], code, max_count, language)

    fields = remove_duplicate_fields fields

    fields = generate_compound_fields(fields, language) # implements #171

    fields.sort! do |x, y|
      y.relatedness <=> x.relatedness
    end

    fields[0..max_count-1]
  end

  # Helper 
  # TODO move... however we only need this here so...
  # http://stackoverflow.com/questions/3897525/ruby-array-contained-in-array-any-order
  private
  def is_subset?(a, of_b)
    a.to_set.subset?(of_b.to_set)
  end
  public

  def extract_fields_with_code_in(fields, codes) 
    fields = fields.dup # copy
    fields.delete_if {|f| !codes.include?(f.code)}
    fields
  end

  # @param fields a list of fields in the API format (FieldEntry) (with relatedness and code )
  # @return The same list of fields plus all compounds that can be generated from it.
  # Implements #
  def generate_compound_fields(fields, language)
    # TODO Remove logging
    # TODO Test (what code gets more specific results thanks to this?) -- once we have "Kinder" in the dictionary this should be easy to find

    Rails.logger.info "generate compounds for fields #{fields}"
    codes = fields.map {|f| f.code}
    Rails.logger.info "codes are: #{codes}"

    rcs = db.get_compound_results_components
    Rails.logger.info "compound table is #{rcs}"

    rcs.each {|rc|
      if is_subset?(rc['components'], codes)
        Rails.logger.info "rc #{rc} is entirely contained"
        fs = extract_fields_with_code_in(fields, rc['components'])
        rmean = 0
        fs.each {|f| rmean += f.relatedness}
        rmean /= fs.size
        Rails.logger.info "components: #{fs}, mean #{rmean}"
        fields << fs_code_to_field_entry(rc['result'], rmean, language)
      end
    }
    fields
  end

  # Handle
  # /api/v1/admin/set??? (values?)
  # TODO Document!
  # Assign new weights ot each info provider. Values is a simple list (?).
  def set_relatedness_weight(vals)
    @weights.each_with_index do |(key, value), index|
      @weights[key] = vals[index] || value
    end
  end

  # TODO Document!
  def get_relatedness_weight
    @weights.values
  end

  def reset_weights
    self.set_relatedness_weight(@@default_weights)
  end

  def get_provider_results(components, code, max_count, language)
    fields = []
    components.each do |provider|
      #p_each(10) # This makes the stacktrace useless - reports all errors here as "Worker error", also loses all puts

      relatedness = @weights[provider]
      # skip provider if relatedness was set to zero
      next unless relatedness > 0.0

      tf = @@providers[provider].get_fields(code, max_count, language)
      Rails.logger.info "#{provider} found: "
      Rails.logger.info tf.empty? ? 'nothing' : tf

      # TODO Couldn't we get a race if we do this in parallel?
      fields.concat(fields_multiply_relatedness(tf, relatedness))
    end
    fields
  end

  # Pass over the resulting filelds array and remove duplicates, summing up their
  # relatedness.
  # TODO Maybe we should just take the max. That is take the first and sort
  # before we do this.

  private
  def remove_duplicate_fields(fields)
    out_fields = {}

    fields.each do |field|
      fs_code = field.code.to_i

      if out_fields.has_key? fs_code
        # PF: We could argue about this algorithm...
        out_fields[fs_code].relatedness += field.relatedness
        out_fields[fs_code].relatedness = 1.0 if out_fields[fs_code].relatedness > 1.0
      else
        out_fields[fs_code] = field
      end
    end

    out_fields.values
  end


  # Multipliy the relatedness of the fields in fcs by fac (0-1).
  def fields_multiply_relatedness(fcs, fac)
    fcs.each { |fc| fc.relatedness *= fac }
    fcs
  end
end
