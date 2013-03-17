class BaseInformationProvider
  def get_fields(field_code, max_count, language)
    raise NotImplementedError
  end

  def get_doctors(field_code, lat, long, count)
    raise NotImplementedError
  end

  def get_field_name(field_code, language)
    raise NotImplementedError
  end

  # classifies the code from user input to icd or chop or unknown
  # accepts only exact matches and is case insensitive
  def get_code_type(input)
    if input.match(/^.\d{2}(\.\d{1,2})?$/)
      :icd
    elsif input.match(/^\d{2}\.\w{0,2}(\.\w{0,2})?$/)
      :chop
    else :unknown
    end
  end
end