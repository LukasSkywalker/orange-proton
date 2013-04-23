require 'geocoder'

# Uses the 'geocoder' gem and coordinates passed as parameters and stored in 
# the DB to sort the doctors specializing in a given field (as retrieveable 
# from the database adapter) accoring to distance to a reference point.
class DoctorLocator

  def initialize
    @db = DatabaseAdapter.new
    # set default units to kilometers:
    Geocoder.configure( :units => :km)
  end

  # @return The raw db entries of at most doctors with a given field of specialization 
  # (fs_code), sorted by distance to the position specified.
  def find_doctors(field_code, lat, long, count)
    assert_field_code(field_code)
    assert_count(count)

    field_doctors = @db.get_doctors_by_fs field_code # get all doctors of specifiled field

    field_doctors.each do |doc|
      d_lat  = doc['lat']
      d_long = doc['long']
      assert_kind_of(Numeric, d_long) unless d_lat.nil?
      assert_kind_of(Numeric, d_lat)  unless d_lat.nil?

      # Calculate distances. Invalid Coordinates are considered to be *very* far away.
      Rails.logger.info "Doctor entry <#{doc}> has illegal/missing coordinates" if (d_lat.nil? || d_long.nil?)
      doc['distance'] = (d_lat.nil? or d_long.nil?) ? 999999 : 
        Geocoder::Calculations.distance_between([d_lat, d_long], [lat, long])
    end

    field_doctors.sort! { |a,b|
      a['distance'] <=> b['distance']
    }

    field_doctors[0..count-1]
  end
end
