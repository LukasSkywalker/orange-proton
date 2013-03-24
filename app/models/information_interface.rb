module InformationInterface
  # promote this module to a class?
  class << self
    attr_accessor :provider
  end

  self.provider = CompoundInfoProvider.new

  module Doctors
    def get_doctors(field_code, lat, long, count)
      InformationInterface.provider.get_doctors(field_code, lat, long, count)
    end
  end

  module IcdData
    def get_fields(code, max_count, lang)
      f = InformationInterface.provider.get_fields(code, max_count, lang)
      if f[:fields].size == 0 && InformationInterface.provider.is_icd_subclass(code)
        f[:fields] = InformationInterface.provider.get_fields(
          InformationInterface.provider.to_icd_superclass(code), 
          max_count, lang)[:fields]
      end
     #puts "before sort"
     #puts f[:fields]
      begin 
      f[:fields].sort! {
        |x,y| 
       #puts "compare #{x} and #{y}"
        y[:relatedness] - x[:relatedness]
      }
      rescue  Exception => e
puts "exc:"
puts e
      end
     #puts "after sort"
     #puts f[:fields]
      f[:fields] = f[:fields][0..max_count-1]
      return f
    end
  end

  module Helpers
    def get_field_name(field_code, lang)
      InformationInterface.provider.get_field_name(field_code, lang)
    end
  end
end
