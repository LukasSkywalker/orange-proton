require 'parallel_each'

# Defines the interface that information providers use. Also defines some helper methods for these to use.
class BaseInformationProvider
  # To be implemented by subclasses:
  
  # Handle queries
  # /api/v1/fields/get?code=string&count=integer&lang=string

  # @return An array of FieldEntries (empty if nothing found). May not contain
  # fs_codes multiple times (TODO Assert in API/CompoundInfoProvider?)
  def get_fields(code, max_count, language)
    raise NotImplementedError
  end

  # The raw icd/chop database entry hash
  def get_icd_or_chop_data(code, language)
    raise NotImplementedError
  end
end
