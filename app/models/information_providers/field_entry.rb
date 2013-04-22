def assert_relatedness(r)
  assert_kind_of(Numeric, r)
  assert(0 <= r && r <= 1)
end

class FieldEntry
  attr_reader :name, :code

  # TODO This can still be changed to a non-relatedness after initialization...
  # but we need to be able to modify it -- custom accessor?
  attr_accessor :relatedness

  # @param code either an icd or chop code
  def initialize(name, relatedness, field_code)
    assert_kind_of(String, name)
    assert_field_code(field_code)
    assert_relatedness(relatedness)

    @name = name
    self.relatedness = relatedness
    @code = field_code.to_i
  end

  def to_s
    "Name: #{self.name}, Relatedness: #{self.relatedness}, Code: #{self.code}"
  end

  def ==(other)
    self.code == other.code &&
      self.name == other.name && 
      self.relatedness == other.relatedness
  end
end

def assert_fields_array(api_fields_array)
  assert_kind_of(Array, api_fields_array)
  assert_kind_of(FieldEntry, api_fields_array[0]) if api_fields_array.length > 0
end

# Takes a fields array formatted as specified by the api and normalizes the 
# relatedness by setting the maximum found relatedness to 1 and the others
# to their relative size compared to that.
def normalize_relatedness(api_fields_array)
  assert_fields_array(api_fields_array)

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

# Multipliy the relatedness of the fields in fcs by fac (0-1). In place.
def fields_multiply_relatedness(api_fields_array, fac)
  assert_fields_array(api_fields_array)

  api_fields_array.each { |fc| fc.relatedness *= fac }
  api_fields_array
end

# Removes duplicates in an array of FieldEntries, summing up their relatedness.
# 
# TODO PF: We could argue about this algorithm... 
# Maybe we should just take the max. That is take the first and sort
# before we do this.
def fold_duplicate_fields(fields)
  assert_fields_array(fields)

  out_fields = {} #use a hash fs_code => field - entry to find duplicates

  fields.each do |field|
    fs_code = field.code.to_i

    # is no duplicate?
    if !out_fields.has_key? fs_code
      out_fields[fs_code] = field
      next
    end
    
    out_fields[fs_code].relatedness += field.relatedness
    out_fields[fs_code].relatedness = 1.0 if out_fields[fs_code].relatedness > 1.0
  end

  out_fields.values
end

