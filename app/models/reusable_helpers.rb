# @return Wether the Array a is fully contained in of_b
def is_subset?(a, of_b)
  assert_kind_of(Array, a)
  assert_kind_of(Array, of_b)
  a.to_set.subset?(of_b.to_set)
end


