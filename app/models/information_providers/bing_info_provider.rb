# Gets the fields based on the results of the bing search.
# Relatedness is amount of results relative to maximal amount of results
class BingInfoProvider < DatabaseInfoProvider

  def get_fields(icd_code, max_count, language)
    out = []
    field_codes = self.db.get_fields_by_bing_rank(icd_code, max_count)

    field_codes.each do |fc|
      out << FieldEntry.new(db.get_fs_name(fc['fs_code'], language),
                            fc['icd_fs_bing_de'],
                            fc['fs_code'])
    end

    normalize_relatedness(out)

    out
  end
end
