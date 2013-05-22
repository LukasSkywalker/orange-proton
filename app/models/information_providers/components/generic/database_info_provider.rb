# Abstract base class for all information providers utilizing the db (which are basically all of them).
class DatabaseInfoProvider

  attr_reader :db

  def initialize
    @db = ObjectFactory.get_database_adapter
  end

  # @param code [String] The icd or chop code to search the fields for.
  # @param max_count [Integer] The maximum amount of results (see {assert_count}).
  # @param catalog [String] The catalog used to resolve the code.
  # @return [Array] An array of {FieldEntry}s that are related to code based on the heuristic this provider implements.
  #   May be empty if there are none found or if the provider implements no heuristics for the given code's type.
  # @raise [NotImplementedError, RuntimeError]
  def get_fields(code, max_count, catalog)
    raise NotImplementedError
  end
end
