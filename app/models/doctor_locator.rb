require_relative 'database_adapter'

class DoctorLocator

  def initialize
    @db = DatabaseAdapter.new
  end

  def find_doctors_within(field_code, lat, long, count)
    field_doctors = @db.get_doctors_by_fs field_code
    ref_loc = {:long => long, :lat => lat}

    field_doctors.each do |doc|
      doc['distance'] = distance_between(ref_loc, {long: doc['long'], lat: doc['lat']})
    end

    field_doctors.sort! { |a,b|
      a['distance'] <=> b['distance']
    }

    field_doctors[0..count-1]
  end

  # rectangular approach, no spherical trigonometrics for Switzerland
  def distance_between (loc1, loc2)
    Math.sqrt((loc2[:long] - loc1[:long])**2 + (loc2[:lat] - loc1[:lat])**2)
  end
end