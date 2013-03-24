class MDCInfoProvider < DatabaseInfoProvider


  def get_fields(icd_code, max_count, language)

    drgs = db.get_drgs(icd_code)
    mdcs = []
    drgs.each do |drg|
      prefix = drg[0]
      mdcs<<db.get_mdc_code(prefix)
    end
    fmhs = []
    fmhnames = []
    fieldhashes = []
    mdcs.each do |mdc|
      db.get_fs_code(mdc).each do |fmh|
        fmhs<<fmh unless fmhs.include? fmh
      end
    end

     puts "mdc........................"
    fmhs.each do |fmh|
      name = db.get_fs_name(fmh,language)
      fmhnames << name unless fmhnames.include?(name)
      fieldhashes<< {
          name: name,
          relatedness: 1, #set to maximum, as there is only manual mapping involved
          field: fmh
      } unless fieldhashes.size >= max_count

    end
    {
        data: db.get_icd(icd_code,language),
        fields:fieldhashes, #get_fields_of_specialization(icd_code, max_count, language),
        type: get_code_type(icd_code)
    }
  end

end