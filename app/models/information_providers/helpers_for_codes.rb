def assert_language(str)
  assert(str == 'de' || str == 'en' || str == 'it' || str == 'fr')
end

def assert_field_code(fs_code)
  assert_kind_of(Integer, fs_code)
  assert(fs_code >= 2)
  assert(fs_code <= 210)
end

# classifies the code from user input to icd or chop or unknown
# accepts only exact matches and is case insensitive
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

# @return true if the given code is an icd subclass code
def icd_subclass?(input)
  assert_kind_of(String, input)
  get_code_type(input) == :icd && input.match(/^(.*\..+)$/)
end

# @return the icd code with the subclass part removed, e.g. B26.9 => B26
def to_icd_superclass(code)
  assert_icd_code(code)
  code.gsub(/([^\.]+)\..*/, '\1')
end

def assert_code(code)
  assert_neq(get_code_type(code), :unknown)
end

def assert_chop_code(code)
  assert_equal(get_code_type(code), :chop)
end

def assert_icd_code(code)
  assert_equal(get_code_type(code), :icd)
end

