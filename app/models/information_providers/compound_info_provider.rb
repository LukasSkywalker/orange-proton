# Speed things up a little bit.
require 'parallel_each'

# Combines other information providers and weights the relatedness of
# the fields the return with globally configurable values.
class CompoundInfoProvider < DatabaseInfoProvider
  def initialize
    super   # you HAVE to call this to get the db attribute.
    @mdcip = MDCInfoProvider.new
    @ips_to_relatedness = {
      ManualInfoProvider.new => 1.0,
      @mdcip => 0.75,
      RangeInfoProvider.new => 0.75,
      ThesaurInfoProvider.new => 0.5,
      StringmatchInfoProvider.new => 0.3,
      BingInfoProvider.new => 0.25
    }
  end
  
  def get_fields(code, max_count, language)
    if get_code_type(code) == :chop
      return @mdcip.get_fields(code, max_count, language)
    end


    # Let all information providers return their results into fields
    fields = []
    @ips_to_relatedness.p_each(10) {|ip, relatedness|
      # skip provider if relatedness was set to zero
      next unless relatedness > 0.0

      tf = ip.get_fields(code, max_count, language)[:fields]
      puts "#{ip.class} found: "
      puts tf.empty? ? 'nothing' : tf

      # TODO Couldn't we get a race if we do this in parallel?
      fields.concat(fields_multiply_relatedness(tf, relatedness))
    }

    {
      data: db.get_icd(code,language),
      fields: remove_duplicate_fields(fields),
      type: get_code_type(code)
    }
  end

  # Handle
  # /api/v1/admin/set??? (values?)
  # TODO Document!
  # Assign new weights ot each info provider. Values is a simple list (?).
  def set_relatedness_weight values
    @ips_to_relatedness.each_with_index do |(key, value), index|
      @ips_to_relatedness[key] = values[index]
    end
  end

  # Pass over the resulting filelds array and remove duplicates, summing up their
  # relatedness.
  # TODO Maybe we should just take the max. That is take the first and sort
  # before we do this.
  private
  def remove_duplicate_fields fields
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
