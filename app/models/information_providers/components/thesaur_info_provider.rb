# This returns the fields for the 'Thesaurus' (pdf file of icd codes belonging to
# some category) the given code appears in.
# This is based on a manually created table.
class ThesaurInfoProvider < DatabaseInfoProvider

  def get_fields(icd_code, max_count, language)
    assert_language(language)
    assert_count(max_count)
    return [] unless get_code_type(icd_code) == :icd

    fields = []

    db.get_available_thesaur_names().each {|tn|
        if db.is_icd_code_in_thesaur_named?(icd_code, tn)
          db.get_fs_codes_for_thesaur_named(tn).each {|fs_code|
            fields << fs_code_to_field_entry(
              fs_code,
              1, # full relatedness -- we have no way to judge more precisely
              # TODO we could weight the fields appearing more often higher!
              language)
          }
        end
    }
    fields[0..max_count-1]
  end
end
