class MDCInfoProvider < DatabaseInfoProvider


  def get_fields(icd_code, max_count, language)

    drgs = db.get_drgs(icd_code)
    mdcs = []
    drgs.each do |drg|
      ascii = drg[0].ord-65
      case ascii
        when 1..17
          mdcs<<ascii
        when 18
          mdcs<<'18A'
        when 19
          mdcs<<'18B'
        when 20..21
          mdcs<< (ascii-1)
        when 22
          mdcs<<'21A'
        when 23
          mdcs<<'21B'
        when 24..25
          mdcs<< (ascii-2)
        else
          mdcs<<:unknown
      end
    end
    fmhs = []
    fmhnames = []
    fieldhash = []
    mdcs.each do |mdc|
      db.get_fmhs(mdc).each do |fmh|
        fmhs<<fmh unless fmhs.include? fmh
      end
    end
    fmhs.each do |fmh|
      name = db.get_fmh_name(fmh,language)
      fmhnames << name unless fmhnames.include?(name)
      fieldhash<< {
          name: name,
          relatedness: 1, #set to maximum, as there is only manual mapping involved
          field: fmh
      }
    end
    {
        data: db.get_icd(icd_code,language),
        fields:fieldhash, #get_fields_of_specialization(icd_code, max_count, language),
        type: get_code_type(icd_code)
    }
  end

end