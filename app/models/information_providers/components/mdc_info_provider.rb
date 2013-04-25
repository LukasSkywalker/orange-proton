# This returns the fields an icd/chop belongs to by looking up it's list of DRGs,
# then figuring out (using a table we were provided with) which MDCs these
# belong to, and finally mapping these to fachgebiete (using a manually created
# table).
class MDCInfoProvider < DatabaseInfoProvider
  def get_fields(code, max_count, catalog)
    assert_count(max_count)
    @db.assert_catalog(catalog)

    return [] if get_code_type(code) == :unknown

    drgs = @db.get_drgs_for_code(code, catalog)

    # Get the prefixes  
    mdcs = drgs.map { |drg|
      prefix = drg[0]
     @db.get_mdc_code(prefix)
    }

    # compile the codes
    fs_codes = []
    mdcs.each do |mdc|
     @db.get_fs_code_by_mdc(mdc).each do |fs_code|
        # TODO give higher weight to fs_codes already included?
        fs_codes<<fs_code unless (fs_codes.include? fs_code) || (fs_codes.length >= max_count)
      end
    end

    fs_codes_to_fields(fs_codes, 1) # full relatedness, we don't know better

  end

end
