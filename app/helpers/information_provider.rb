class MockInfoProvider
  def get_icd_data(field_code, lang)
    raise NotImplementedError
  end

  def get_doctors(field_code, lat, long, count)
    raise NotImplementedError
  end

  def get_fields(field_code, max_count, lang)
    raise NotImplementedError
  end

  def get_field_name(field_code, lang)
    raise NotImplementedError
  end
end