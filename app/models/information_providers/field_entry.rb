# Raises an excpetion if r is not in the range [0,1]
def assert_relatedness(r)
  assert_kind_of(Numeric, r)
  assert(0 <= r && r <= 1)
end

# The field entries as passed around by the information providers.
# Only code and relatedness of this is used at first, it is then localised by the api via
# a localised_data_provider, then converted to a hash/json object in api_response.
class FieldEntry
  attr_reader :name, :code, :relatedness, :fallbacks

  # @param code either an icd or chop code
  def initialize(relatedness, field_code)
    assert_field_code(field_code)

    set_relatedness(relatedness)
    @name = "<unlocalized #{field_code}>"
    @code = field_code.to_i
    @fallbacks = []
  end

  private
  def clamp_relatedness
    @relatedness = 1.0 if @relatedness > 1.0
    @relatedness = 0.0 if @relatedness < 0.0
  end

  public
  def add_fallback(code)
    @fallbacks << {:code => code, :name => "<unlocalized #{code}>"}
  end

  # Adds r to the relatedness and clamps the resulting relatedness to the allowed range.
  def increase_relatedness(r)
    assert_kind_of(Numeric, r)
    @relatedness += r
    clamp_relatedness
  end

  # Mulitplies the relatedness by f and clamps the relatedness to the allowed range [0,1].
  def multiply_relatedness(f)
    assert_kind_of(Numeric, f)
    @relatedness *= f
    clamp_relatedness
  end

  # @param r a valid relatedness ([0,1])
  def set_relatedness(r)
    assert_relatedness(r)
    @relatedness = r
  end

  def to_s
    "<Name: #{self.name}, Relatedness: #{self.relatedness}, Code: #{self.code}>"
  end

  def ==(other)
    self.code == other.code &&
      self.name == other.name && 
      self.relatedness == other.relatedness
  end

  # @param db [DatabaseAdapter] The db connection needed to resolve the text.
  # @param lang [String] "de", "fr", "it", "en"
  # Sets self.name to be the localised name of the self.code. self.name will be nil if the code doesn't exist.
  # All codes can be translated to all supported languages.
  def localise(db, lang)
    assert_language(lang)
    assert(db)
    @name = db.get_fs_name(self.code, lang)
    fallbacks.each{ |f|
      f[:name] = db.get_fs_name(f[:code], lang)
    }
  end
end

# @param field_codes [Array] an array of fs codes (2-210)
# @return [Array] An array of field codes formatted as by API standard ({name : "...",
#   relatedness: relatedness, field: code} for each code, that is an array of
#   FieldEntry objects)
def fs_codes_to_fields(field_codes, relatedness)
  assert_kind_of(Array, field_codes)
  assert_kind_of(Integer, field_codes[0]) if field_codes.length > 0
  assert_relatedness(relatedness)

  field_codes.map { |fc|
    fs_code_to_field_entry(fc, relatedness)
  }
end

# Same as fs_codes_to_fields, but just for one code.
def fs_code_to_field_entry(fs_code, relatedness)
  assert_relatedness(relatedness)
  assert_field_code(fs_code)
  FieldEntry.new(
                 relatedness,
                 fs_code
                )
end

# Raises an exception if api_fields_array is not an Array of {FieldEntry}s.
def assert_fields_array(api_fields_array)
  assert_kind_of(Array, api_fields_array)
  assert_kind_of(FieldEntry, api_fields_array[0]) if api_fields_array.length > 0
end

# Takes a FieldEntry array and normalizes the relatedness by setting the maximum found relatedness
# to 1 and the others to their relative magnitude compared to that.
def normalize_relatedness(api_fields_array)
  assert_fields_array(api_fields_array)

  tot = 0
  api_fields_array.each do |fc|
    v = fc.relatedness
    tot = v > tot ? v : tot # max() is actually not defined by default!
  end
  return api_fields_array if tot == 0
  return fields_multiply_relatedness(api_fields_array, 1.0/tot)
end

# Multipliy the relatedness of the fields in the FieldEntry array api_fields_array by fac.
# Clamps the resulting relatedness. In place.
def fields_multiply_relatedness(api_fields_array, fac)
  assert_fields_array(api_fields_array)

  api_fields_array.each { |fc| fc.multiply_relatedness( fac) }
  api_fields_array
end

# Removes duplicates in an array of FieldEntries, summing up their relatedness.
def fold_duplicate_fields(fields)
  assert_fields_array(fields)

  out_fields = {} # use a hash fs_code => field - entry to find duplicates

  fields.each do |field|
    fs_code = field.code.to_i

    # is no duplicate?
    if !out_fields.has_key? fs_code
      out_fields[fs_code] = field
      next
    end
    # is duplicate
    out_fields[fs_code].increase_relatedness(field.relatedness)
  end

  out_fields.values
end

