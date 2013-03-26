class ManualInfoProvider < DatabaseInfoProvider 
  def get_fields(icd_code, max_count, language)
    return  {
        data: db.get_icd(icd_code,language),
        fields: format_fs_codes_for_api( 
              db.get_manually_mapped_fs_codes_for_icd(icd_code), 1, language),
        type: get_code_type(icd_code)
    }
  end
end
