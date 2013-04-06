# Speed things up a little bit.
require 'parallel_each'

# Combines other information providers and weights the relatedness of
# the fields the return with globally configurable values.
class CompoundInfoProvider < DatabaseInfoProvider
  PComp = Struct.new(:provider, :relatedness)

  def initialize
    super
    @components = {
        ManualInfoProvider => PComp.new(ManualInfoProvider.new, 1.0),
        MDCInfoProvider => PComp.new(MDCInfoProvider.new, 0.75),
        RangeInfoProvider => PComp.new(RangeInfoProvider.new, 0.75),
        ThesaurInfoProvider => PComp.new(ThesaurInfoProvider.new, 0.5),
        StringmatchInfoProvider => PComp.new(StringmatchInfoProvider.new, 0.3),
        BingInfoProvider => PComp.new(BingInfoProvider.new, 0.25),
    }
  end
  
  def get_fields(code, max_count, language)
    if get_code_type(code) == :chop
      return @components[MDCInfoProvider].provider.get_fields(code, max_count, language)
    end

    # Let all information providers return their results into fields
    fields = get_provider_results(code, max_count, language)

    # is this even necessary now?
    fields = get_provider_results(self.to_icd_superclass(code), max_count, language) if
        fields.size <= 0 and self.is_icd_subclass(code)

    fields = remove_duplicate_fields fields

    fields.sort! do |x, y|
      y[:relatedness] - x[:relatedness]
    end

    fields = fields[0..max_count-1]

    {
      data: db.get_icd(code,language),
      fields: fields,
      type: get_code_type(code)
    }
  end

  # Handle
  # /api/v1/admin/set??? (values?)
  # TODO Document!
  # Assign new weights ot each info provider. Values is a simple list (?).
  def set_relatedness_weight values
    @components.each_with_index do |(key, value), index|
      @components[key].relatedness = values[index]
    end
  end

  def get_provider_results(code, max_count, language)
    fields = []
    @components.p_each(10) {|provider_name, component|
      relatedness = component.relatedness
      # skip provider if relatedness was set to zero
      next unless relatedness > 0.0

      tf = component.provider.get_fields(code, max_count, language)[:fields]
      puts "#{provider_name} found: "
      puts tf.empty? ? 'nothing' : tf

      # TODO Couldn't we get a race if we do this in parallel?
      fields.concat(fields_multiply_relatedness(tf, relatedness))
    }
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
      code = field[:field].to_i

      if out_fields.has_key? code
        out_fields[code][:relatedness] += field[:relatedness]
        out_fields[code][:relatedness] = 1.0 if out_fields[code][:relatedness] > 1.0
      else
        out_fields[code] = field
      end
    end

    out_fields.values
  end

  # Multipliy the relatedness of the fields in fcs by fac (0-1).
  def fields_multiply_relatedness(fcs, fac)
    fcs.each{ |fc| fc[:relatedness] *= fac }
    fcs
  end
end
