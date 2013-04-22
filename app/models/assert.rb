# Assertions for the implemntation -- these should never propagate to the client (because they should always be true...)
# Yes, going around checking types in a language without explicit types seems
# like overkill, but it's always good to make assumptions explicit.


# Raises an exception if v is nil or not kind of class (that is , has kclass as one of its superclasses).
def assert_kind_of(kclass,v)
  raise "\n<#{v}> expected to be kind_of?
  <#{kclass.name}> but was
  <#{v.class.name}>."  unless v.kind_of?(kclass)
end

# Raises an exception if the argument is nil, false or 0
def assert(a)
  if (a == nil || a.kind_of?(FalseClass) || (a.kind_of?(Numeric) && a == 0))
    raise "\n<#{a}> was expected to be non nil/0/false"
  end
end

def assert_neq(a,b)
  raise "\n<#{a}> was expected to be not equal to 
<#{b}> but was equal" unless a != b
end

def assert_equal(a,b)
  raise "\n<#{a}> was expected to be equal to 
<#{b}> but wasn't" unless a == b
end

def assert_count(a)
  assert_kind_of(Integer, a)
  assert(a >= 0)
  assert(a < 32) # we should never have to deal with large requests
end
