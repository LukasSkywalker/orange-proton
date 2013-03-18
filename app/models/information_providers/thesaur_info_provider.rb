class ThesaurInfoProvider < DatabaseInfoProvider

  def get_fields(icd_code, max_count, language)

    fields = []

    db.get_available_thesaur_names().each {|tn|
        if db.is_icd_code_in_thesaur_named?(icd_code, tn)
          db.get_fs_codes_for_thesaur_named(tn).each {|fs_code|
            fields << {
                name: db.get_fs_name(fs_code, language),
                relatedness: 1, #set to maximum, as there is only manual mapping involved
                field: fs_code
            } unless fields.size>=4
          }
          #{:tn => tn, :r => db.get_fs_codes_for_thesaur_named(tn)}
        end
    }

    return  {
        data: db.get_icd(icd_code,language),
        fields:fields,
        type: get_code_type(icd_code)
    }
  end

end