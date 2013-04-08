# Returns the fachgebiete an icd was manually mapped to (specified via manually: 1 in the relationFSZuICD database entry).
class ManualInfoProvider < DatabaseInfoProvider 
  def get_fields(icd_code, max_count, language)
    self.fs_codes_to_fields(self.db.get_manually_mapped_fs_codes_for_icd(icd_code), 1, language)
  end
end
