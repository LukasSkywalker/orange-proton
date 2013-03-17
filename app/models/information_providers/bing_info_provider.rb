# Information Provider for live realworld data, originating from real database
class BingInfoProvider < DatabaseInfoProvider

  def get_fields(icd_code, max_count, language)
    {
        data: db.get_icd(icd_code,language),
        fields: get_fields_of_specialization(icd_code, max_count, language),
        type: get_code_type(icd_code)
    }
  end

  private
  def get_fields_of_specialization(icd_code, max_count, lang)
    out = []
    field_codes = self.db.get_fields_by_bing_rank(icd_code, max_count)
    field_codes.each do |fc|
      out << {
          name: db.get_fs_name(fc['fs_code'],lang),
          relatedness: fc['icd_fs_bing_de'],
          field: fc['fs_code']
      }
    end
    out
  end
end
