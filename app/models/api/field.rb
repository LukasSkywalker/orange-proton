
class Field
  attr_accessor :name, :relatedness, :code

  class << self
    def create(name, relatedness, code)
      new = Field.new
      new.name = name
      new.relatedness = relatedness
      new.code = code
      new
    end
  end
end