# This provider returns some example data to show the format to be followed
# by the other providers.
# It can also be used for testing.
class MockInfoProvider

  def get_fields(code, count, catalog)
    assert_code(code)
    assert_count(count)
    [
        FieldEntry.new(0.8, 200),
        FieldEntry.new(0.7, 200),
        FieldEntry.new(0.6, 200)
    ]
  end

end
