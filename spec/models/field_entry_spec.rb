require 'spec_helper' # TODO do we really need to write this everytime?

describe FieldEntry do
  it 'should normalize relatedness' do
    before_normalizing = [FieldEntry.new(0.5, 122),
                          FieldEntry.new(0.25, 123),
                          FieldEntry.new(0.125, 124)]

    after_normalizing =  [FieldEntry.new(1.0, 122),
                          FieldEntry.new(0.5, 123),
                          FieldEntry.new(0.25, 124)]

    normalize_relatedness(before_normalizing).should eq(after_normalizing)
  end
end