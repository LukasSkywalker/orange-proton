

class RangeInfoProvider < DatabaseInfoProvider
  def get_fields(icd_code, max_count, language)
    ranges = db.get_ranges(icd_code)
    fields = []
    ranges.each() do |range|
      codes = range['fmhcodes']
      codes.each() do |code|
        name = db.get_fs_name(code, language)
        relatedness = 0.6 + (range['level'].to_i * 0.1)
        if (fields.select{|f| f[:field]==code }).empty?
          fields << {
              name: name,
              relatedness: relatedness,
              field: code
          }
        else
          unless (fields.select{|f| f[:field]==code and f[:relatedness]<relatedness}).empty?
            existing = fields.select{|f| f[:field]==code and  f[:relatedness]<relatedness}[0]
            puts existing
            existing[:relatedness] = relatedness
            puts existing
          end
        end
      end
      fields
    end

    {
        data:   db.get_icd(icd_code,language),
        fields: fields,
        type:   get_code_type(icd_code)
    }
  end
end