require 'parallel_each'

# Combines other information providers
class CompoundInfoProvider < DatabaseInfoProvider

  def initialize
    super   # you HAVE to call this to get db
    @ips_to_relatedness = {
      ManualInfoProvider.new => 1.0,
      MDCInfoProvider.new => 0.75,
      RangeInfoProvider.new => 0.75,
      ThesaurInfoProvider.new => 0.5,
      StringmatchInfoProvider.new => 0.3,
      BingInfoProvider.new => 0.25
    }
  end
  
  def get_fields(icd_code, max_count, language)
    fields = []

    @ips_to_relatedness.p_each(10) {|ip, relatedness|
      tf = ip.get_fields(icd_code, max_count, language)[:fields]
      puts "#{ip.class} found: "
      puts tf.empty? ? 'nothing' : tf


      fields.concat(fields_multiply_relatedness(tf, relatedness))
    }

    {
      data: db.get_icd(icd_code,language),
      fields: remove_dublicate_fields(fields),
      type: get_code_type(icd_code)
    }
  end

  def set_relatedness_weight values
    @ips_to_relatedness.each_with_index do |(key, value), index|
      @ips_to_relatedness[key] = values[index].to_i/100.0
    end
  end

  private
  def remove_dublicate_fields fields
    out_fields = {}

    fields.each do |field|
      code = field[:field]

      if out_fields.has_key? code
        out_fields[code][:relatedness] += field[:relatedness]
        out_fields[code][:relatedness] = 1.0 if out_fields[code][:relatedness] > 1.0
      else
        out_fields[code] = field
      end
    end

    out_fields.values
  end

  def fields_multiply_relatedness(fcs, fac)
    fcs.each{ |fc| fc[:relatedness] *= fac }
    fcs
  end
end
