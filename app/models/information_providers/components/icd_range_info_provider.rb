# This info provider finds the fields a given ICD code belongs to by looking
# up all the ICD code ranges the code belongs to (e.g. B26 is in something like B20-B30, which is in A00-B99 etc.)
# This is based on a manually created table specifying fields for these ranges.
class IcdRangeInfoProvider < DatabaseInfoProvider

  # Weights for fs_codes found in the ranges of level 1 to 4 (in that order)
  @@level_ratings = [0.2, 0.6, 0.8, 1.0]

  def get_fields(icd_code, max_count, language)
    assert_language(language)
    assert_count(max_count)
    return [] unless get_code_type(icd_code) == :icd

    ranges = db.get_icd_ranges(icd_code)

    fields = []
    ranges.each do |range|
      codes = range['fmhcodes']
      codes.each do |code|
        level = range['level'].to_i
        assert(level <= 4 && level >= 1)
        relatedness = @@level_ratings[level - 1]
        assert_relatedness(relatedness) # always good to assert

        # If this is a new code, add it
        if (fields.select{|f| f.code==code }).empty?
          fields << fs_code_to_field_entry(code, relatedness, language)
        else
          # otherwise possibly upgrade relatedness
          unless (fields.select{|f| f.code==code and f.relatedness<relatedness}).empty?
            existing = fields.select{|f| f.code==code and f.relatedness<relatedness}[0]
            Rails.logger.info existing
            existing.relatedness = relatedness
            Rails.logger.info existing
          end
        end
      end
    end

    fields[0..max_count-1]
  end
end
