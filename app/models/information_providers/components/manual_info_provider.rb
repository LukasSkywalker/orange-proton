# Returns the fachgebiete an icd/chop was manually mapped to (specified via an entry in the manualMappings table).
class ManualInfoProvider < DatabaseInfoProvider 
  def get_fields(code, max_count, language)
    self.fs_codes_to_fields(
        (get_code_type(code) == :icd) ?
            self.db.get_manually_mapped_fs_codes_for_icd(code) :
            self.db.get_manually_mapped_fs_codes_for_chop(code),
        1, # relatedness full
        language)
  end
end