# This returns the fields for the 'Thesaurus' (pdf file of icd codes belonging to
# some category) the given code appears in.
# This is based on a manually created table.
class ThesaurInfoProvider < DatabaseInfoProvider

  def get_fields(icd_code, max_count, language)

    fields = []

    db.get_available_thesaur_names().each {|tn|
        if db.is_icd_code_in_thesaur_named?(icd_code, tn)
          db.get_fs_codes_for_thesaur_named(tn).each {|fs_code|
            fields << FieldEntry.new(db.get_fs_name(fs_code, language), 1, fs_code)
          }
        end
    }
    fields
  end
end
