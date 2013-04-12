# Speed things up a little bit.
require 'parallel_each'

# Combines other information providers and weights the relatedness of
# the fields the return with globally configurable values.
class CompoundInfoProvider < DatabaseInfoProvider
  #d default weights for prodiers
  @@dw = [1.0, 0.75, 0.75, 0.5, 0.6, 0.75]

  # provider pool
  @@providers = {
      ManualInfoProvider => ManualInfoProvider.new,
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
        ManualInfoProvider => @@dw[0],
        MDCInfoProvider => @@dw[1],
        IcdRangeInfoProvider => @@dw[2],
        ThesaurInfoProvider => @@dw[3],
        StringmatchInfoProvider => @@dw[4],
        ChopRangeInfoProvider => @@dw[5]
    }

    @components = {
        :icd => [ManualInfoProvider, MDCInfoProvider, IcdRangeInfoProvider,ThesaurInfoProvider, StringmatchInfoProvider],
        :chop => [ChopRangeInfoProvider, MDCInfoProvider]
    }

  end

  def get_fields(code, max_count, language)
    # Let all information providers return their results into fields
    fields = get_provider_results(@components[get_code_type(code)], code, max_count, language)

    fields = remove_duplicate_fields fields

    fields.sort! do |x, y|
      y.relatedness <=> x.relatedness
    end

    fields[0..max_count-1]
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
    self.set_relatedness_weight(@@dw)
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
