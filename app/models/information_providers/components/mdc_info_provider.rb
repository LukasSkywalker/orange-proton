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

    mdcs = drgs.map { |drg|
      prefix = drg[0]
      db.get_mdc_code(prefix)
    }

    fs_codes = []
    mdcs.each do |mdc|
      db.get_fs_code_by_mdc(mdc).each do |fs_code|
        # TODO give higher weight to fs_codes already included?
        fs_codes<<fs_code unless fs_codes.include? fs_code || fs_codes.lenght >= max_count
      end
    end

    return fs_codes.map { |fs_code|
      fs_code_to_field_entry(fs_code,
                             1, # full relatedness, we don't know better
                             language)
    }
  end

end
