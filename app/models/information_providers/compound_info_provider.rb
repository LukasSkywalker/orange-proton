# Combines other information providers
class CompoundInfoProvider < DatabaseInfoProvider

  def initialize
    super   # you HAVE to call this to get db
    @ips_to_relatedness = {
      ManualInfoProvider.new => 1.0,
      MDCInfoProvider.new => 0.75,
      ThesaurInfoProvider.new => 0.5,
      StringmatchInfoProvider.new => 0.3,
      BingInfoProvider.new => 0.25
    }
  end

  def fields_multiply_relatedness(fcs, fac)
    fcs.each{ |fc| fc[:relatedness] *= fac }
    fcs
  end
  
  def get_fields(icd_code, max_count, language)
    fields = []

    @ips_to_relatedness.each {|ip, relatedness|
      tf = ip.get_fields(icd_code, max_count, language)[:fields]
      puts "#{ip.class} found: "
      puts tf.empty? ? 'nothing' : tf
      fields.concat(fields_multiply_relatedness(tf, relatedness))
    }

    {
      data:  db.get_icd(icd_code,language),
      fields:fields,
      type: get_code_type(icd_code)
    }
  end
end
