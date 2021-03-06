# This info provider finds the fields a given ICD code belongs to by looking
# up all the ICD code ranges the code belongs to (e.g. B26 is in something like B20-B30, which is in A00-B99 etc.)
# This is based on a manually created table specifying fields for these ranges in order of relatedness.
class IcdRangeInfoProvider < DatabaseInfoProvider

  # Weights for fs_codes found in the ranges of level 1 to 4 (in that order)
  @@level_ratings = [0.2, 0.6, 0.8, 1.0]
  @@ranking_decay_coefficient = 0.1

  # @note Returns an empty array if chop_code is not an icd code.
  # @see DatabaseInfoProvider#get_fields
  def get_fields(icd_code, max_count, catalog)
    @db.assert_catalog(catalog)
    assert_count(max_count)

    return [] unless get_code_type(icd_code) == :icd

    ranges = @db.get_icd_ranges(icd_code)
    fields = []

    ranges.each do |range|
      codes = range['fmhcodes']
      for i in 0..codes.length-1
        code = codes[i]
        level = range['level'].to_i
        assert(level <= 4 && level >= 1)
        relatedness = @@level_ratings[level - 1]*(1-i*@@ranking_decay_coefficient)
        assert_relatedness(relatedness) # always good to assert

        # If this is a new code, add it
        if (fields.select{|f| f.code==code }).empty?
          fields << fs_code_to_field_entry(code, relatedness)
        else
          # otherwise possibly upgrade relatedness
          existing = fields.select{|f| f.code==code and f.relatedness<relatedness} 
          unless existing.empty?
            assert_equal(existing.length, 1)
            existing = existing[0]
            Rails.logger.info existing
            existing.set_relatedness(relatedness)
            Rails.logger.info existing
          end
        end
      end
    end

    fields[0..max_count-1]
  end
end
