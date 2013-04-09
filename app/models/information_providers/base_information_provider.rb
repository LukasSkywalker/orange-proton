require 'parallel_each'

# Defines the interface that information providers use. Also defines some helper methods for these to use.
class BaseInformationProvider
  # To be implemented by subclasses:
  
  # Handle queries
  # /api/v1/fields/get?code=string&count=integer&lang=string
  def get_fields(field_code, max_count, language)
    raise NotImplementedError
  end

  # Handle
  # /api/v1/docs/get?long=float&lat=float&field=int&count=int
  def get_doctors(field_code, lat, long, count)
    raise NotImplementedError
  end

  # Handle
  # /api/v1/codenames/get?code=string&lang=string
  def get_field_name(field_code, language)
    raise NotImplementedError
  end

  def get_icd_or_chop_data (code, language)
    raise NotImplementedError
  end

  # Helpers:

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
  def icd_subclass?(input)
    get_code_type(input) == :icd && input.match(/^(.*\..+)$/)
  end

  # @return the icd code with the subclass part removed, e.g. B26.9 => B26
  def to_icd_superclass(code)
    code.gsub(/([^\.]+)\..*/, '\1')
  end

  # Takes a fields array formatted as specified by the api and normalizes the 
  # relatedness by setting the maximum found relatedness to 1 and the others
  # to their relative size compared to that.
  def normalize_relatedness(api_fields_array)
    tot = 0
    api_fields_array.each do |fc|
      v = fc.relatedness
      tot = v > tot ? v : tot # max() is actually not defined by default!
    end
    return api_fields_array if tot == 0
    tot *= 1.0
    api_fields_array.each {|e| 
      e.relatedness = (1.0*e.relatedness)/tot
    }
    api_fields_array
  end
end
