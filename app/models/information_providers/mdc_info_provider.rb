# This returns the fields an icd belongs to by looking up it's list of DRGs,
# then figuring out (using a table we were provided with) which MDCs these
# belong to, and finally mapping these to fachgebiete (using a manually created
# table).
class MDCInfoProvider < DatabaseInfoProvider
  def get_fields(code, max_count, language)
    code_type = get_code_type(code)

    drgs = []
    if code_type == :icd
      drgs = db.get_drgs(code) # TODO Rename to get drgs for icd or make it detect code type (then we have to move the detection...)
    else
      drgs = db.get_drgs_for_chop(code)
    end

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

    fmhs.each do |fmh|
      name = db.get_fs_name(fmh,language)
      fmhnames << name unless fmhnames.include?(name)
      fieldhashes<< {
        name: name,
        relatedness: 1, #set to maximum, as there is only manual mapping involved
        field: fmh
      } unless fieldhashes.size >= max_count
    end
   
    # finally
    return {
      data: code_type == :icd ? db.get_icd(code,language) : db.get_chop_entry(code,language),
      fields:fieldhashes, #get_fields_of_specialization(icd_code, max_count, language),
      type: code_type
    }
  end

end
