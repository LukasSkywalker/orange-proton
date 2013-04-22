# This returns the fields an icd belongs to by looking up it's list of DRGs,
# then figuring out (using a table we were provided with) which MDCs these
# belong to, and finally mapping these to fachgebiete (using a manually created
# table).
class MDCInfoProvider < DatabaseInfoProvider
  def get_fields(code, max_count, language)
    assert_language(language)
    assert_count(max_count)
    code_type = get_code_type(code)
    return [] if code_type == :unknown

    drgs = (code_type == :icd) ? db.get_drgs_for_icd(code) : db.get_drgs_for_chop(code)

    mdcs = []
    drgs.each do |drg|
      prefix = drg[0]
      mdcs<<db.get_mdc_code(prefix)
    end

    fmhs = []
    mdcs.each do |mdc|
      db.get_fs_code_by_mdc(mdc).each do |fmh|
        fmhs<<fmh unless fmhs.include? fmh
      end
    end

    fields = []
    fmhs.each do |fmh|
      name = db.get_fs_name(fmh,language)
      fields << FieldEntry.new(name, 1, fmh) unless fields.size >= max_count
    end
   
    fields
  end

end
