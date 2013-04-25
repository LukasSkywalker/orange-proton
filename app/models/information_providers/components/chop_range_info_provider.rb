# This info provider finds the fields a given CHOP code belongs to by looking
# up all the CHOP code ranges the code belongs to.
# This is based on a manually created table specifying fields for these ranges.
class ChopRangeInfoProvider < DatabaseInfoProvider

  def get_fields(chop_code, max_count, catalog)
    assert_count(max_count)
    @db.assert_catalog(catalog)

    return [] unless get_code_type(chop_code) == :chop

    ranges = @db.get_chop_ranges(chop_code)
    fields = []

    ranges.each do |range|
      codes = range['fmhcodes']
      codes.each do |code|
        code = code.to_i # some of these are floats in the db unfortunately...
        fields << fs_code_to_field_entry(code, 1.0) # full relatedness, we don't know better
                                                    # MH: adapt chop_range_spec if you change relatedness
                                 # TODO Consider size/precision of range like in icd range?
      end
    end

    fields = fold_duplicate_fields fields
    fields[0..max_count-1]
  end
end
