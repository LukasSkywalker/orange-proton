class FieldEntry
  attr_accessor :name, :relatedness, :code

  def initialize(name, relatedness, code)
    self.name = name
    self.relatedness = relatedness
    self.code = code.to_i
  end

  def to_s
    "Name: #{self.name}, Relatedness: #{self.relatedness}, Code: #{self.code}"
  end
end