require 'parallel_each'

# Defines the interface that information providers use. Also defines some helper methods for these to use.
class BaseInformationProvider
  # to be implemented by subclasses
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

  # @return true if the given code is an icd subclass code
  def is_icd_subclass(input)
    get_code_type(input) == :icd && input.match(/.*\.*./)
  end

  # @return the icd code with the subclass part removed, e.g. B26.9 => B26
  def to_icd_superclass(code)
    code.gsub(/([^\.]+)\..*/, '\1')
  end

  # @param field_codes [Array] an array of fs codes (2-210)
  # @return An array of field codes formatted as by API standard ({name : "...", relatedness: relatedness, field: code} for each code)
  def format_fs_codes_for_api(field_codes, relatedness, lang)
    out = []
    field_codes.p_each(5) do |fc|
      out << format_fs_code_for_api(fc, relatedness, lang) 
    end
    out
  end

  # same as above, but just for one code
  def format_fs_code_for_api(fs_code, relatedness, lang)
    {
      name: db.get_fs_name(fs_code, lang),
      relatedness: relatedness,
      field: fs_code
    }
  end

  def normalize_relatedness(api_fields_array)
    tot = 0
    api_fields_array.each do |fc|
      v = fc[:relatedness]
      tot = v > tot ? v : tot # max() is actually not defined by default!
    end
return api_fields_array if tot == 0
    tot *= 1.0
    api_fields_array.each {|e| 
      e[:relatedness] = (1.0*e[:relatedness])/tot
    }

    api_fields_array
  end
end
