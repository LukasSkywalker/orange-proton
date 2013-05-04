# Raises an exception if str is not in ["de", "en", "fr", "it"]
def assert_language(str)
  raise "#{str} is not a valid language" unless str == 'de' || str == 'en' || str == 'it' || str == 'fr'
end

# Raises an exception if fs_code cannot be a field code/fmh code (an Integer in the range 2 - 210)
def assert_field_code(fs_code)
  raise "#{fs_code} is not a valid field code" unless fs_code.kind_of?(Integer) && fs_code >= 2 && fs_code <= 210
end

# @param input [String] The potential code to be classified.
# Classifies the code from user input to icd or chop or unknown
# accepts only exact matches and is case insensitive.
# @return [Identifier] Either :icd, :chop or :unknown
def get_code_type(input)
  assert_kind_of(String, input)
  if input.match(/(^\b[A-Z]\d{2}(?:\.\d{1,2})?\b[*+!]?$)/)
    :icd
  elsif input.match(/(^[A-Z]?(\d{2}(\.\w{2})?(\.\w{1,2})?)$)/)
    :chop
  else 
    :unknown
  end
end

# @return true if the given code is an icd subclass code (has a dot)
def icd_subclass?(input)
  assert_kind_of(String, input)
  get_code_type(input) == :icd && input.match(/^(.*\..+)$/)
end

# @return the icd code with the subclass part removed, e.g. B26.9 => B26
def to_icd_superclass(code)
  assert_icd_code(code)
  code.gsub(/([^\.]+)\..*/, '\1')
end

# Raises an exception if the type of the code is unknown.
def assert_code(code)
  assert_neq(get_code_type(code), :unknown)
end

# Raises an exception if code is not a chop code.
def assert_chop_code(code)
  assert_equal(get_code_type(code), :chop)
end

# Raises an exception if code is not an icd code.
def assert_icd_code(code)
  assert_equal(get_code_type(code), :icd)
end

