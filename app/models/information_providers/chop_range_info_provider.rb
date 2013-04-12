# This info provider finds the fields a given CHOP code belongs to by looking
# up all the CHOP code ranges the code belongs to.
# This is based on a manually created table specifying fields for these ranges.
class ChopRangeInfoProvider < DatabaseInfoProvider
  def get_fields(chop_code, max_count, language)
    ranges = db.get_chop_ranges(chop_code)
    fields = []
    ranges.each() do |range|
      codes = range['fmhcodes']
      codes.each() do |code|
        name = db.get_fs_name(code, language)
        relatedness = 1.0
        if (fields.select{|f| f.code==code }).empty?
          fields << FieldEntry.new(name, relatedness, code)
        end
      end
    end

    fields
  end
end
