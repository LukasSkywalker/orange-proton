# Defines the interface that information providers use. Also defines some helper methods for these to use.
class BaseInformationProvider
  # To be implemented by subclasses:
  
  # Handle queries
  # /api/v1/fields/get?code=string&count=integer&lang=string

  # @return An array of FieldEntries (empty if nothing found). May not contain
  # fs_codes multiple times (TODO Assert in API/CompoundInfoProvider?)
  def get_fields(code, max_count, catalog)
    raise NotImplementedError
  end
end
