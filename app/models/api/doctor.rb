require 'mongo_mapper'

class Doctor
  attr_accessor :name, :title, :address, :email, :phone1, :phone2, :canton, :docfield

  class << self
    def create(name, title, address, email, phone1, phone2, canton, docfield)
      new = Doctor.new
      new.name = name
      new.address = address
      new.email = email
      new.phone1 = phone1
      new.phone2 = phone2
      new.canton = canton
      new.docfield = docfield
      new
    end
  end
end