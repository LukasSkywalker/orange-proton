# Speed things up a little bit.
require 'parallel_each'

# Combines other information providers and weights the relatedness of
# the fields the return with globally configurable values.
class CompoundInfoProvider < DatabaseInfoProvider
  PComp = Struct.new(:provider, :relatedness)
  @@dw = [1.0, 0.75, 0.75, 0.5, 0.3]

  def initialize
    super
    @components = {
        ManualInfoProvider => PComp.new(ManualInfoProvider.new, @@dw[0]),
        MDCInfoProvider => PComp.new(MDCInfoProvider.new, @@dw[1]),
        RangeInfoProvider => PComp.new(RangeInfoProvider.new, @@dw[2]),
        ThesaurInfoProvider => PComp.new(ThesaurInfoProvider.new, @@dw[3]),
        StringmatchInfoProvider => PComp.new(StringmatchInfoProvider.new, @@dw[4]),
    }
  end
  
  def get_fields(code, max_count, language)
    if get_code_type(code) == :chop
      return @components[MDCInfoProvider].provider.get_fields(code, max_count, language)
    end

    # Let all information providers return their results into fields
    fields = get_provider_results(code, max_count, language)

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
    @components.values.each_with_index do |component, index|
      Rails.logger.info vals[index]
      component.relatedness = vals[index]
    end
  end

  # TODO Document!
  def get_relatedness_weight
    out = []
    @components.values.each do |comp|
      out << comp.relatedness
    end
    out
  end

  def reset_weights
    self.set_relatedness_weight(@@dw)
  end

  def get_provider_results(code, max_count, language)
    fields = []
    @components.each do |provider_name, component|
      #p_each(10) # This makes the stacktrace useless - reports all errors here as "Worker error", also loses all puts

      relatedness = component.relatedness
      # skip provider if relatedness was set to zero
      next unless relatedness > 0.0

      tf = component.provider.get_fields(code, max_count, language)
      Rails.logger.info "#{provider_name} found: "
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
    fcs.each{ |fc| fc.relatedness *= fac }
    fcs
  end
end
