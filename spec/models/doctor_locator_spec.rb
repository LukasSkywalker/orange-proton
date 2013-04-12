require 'spec_helper'

describe DoctorLocator do

  before do
    @locator = DoctorLocator.new
    @db = @locator.instance_variable_get(:@db)

    @db.stub(:get_doctors_by_fs).with(anything).and_return(
        [{ 'lat' => 7.0, 'long' => 49.0 },
         { 'lat' => 8.0, 'long' => 48.0 },
         { 'lat' => 9.0, 'long' => 47.0 },
         { 'lat' => 10.0, 'long' => 50.0 }]
    )
  end

  it 'return only as many doctors as specified' do
    doctors = @locator.find_doctors(2, 7.0, 49.0, 2)
    doctors.should have_at_most(2).items
  end

  it 'should return closest doctors for (7, 49)' do
    doctors = @locator.find_doctors(2, 7.0, 49.0, 5)

    doctors.should ==[{ 'lat' => 7.0, 'long' => 49.0, 'distance' => anything },
     { 'lat' => 8.0, 'long' => 48.0, 'distance' => anything },
     { 'lat' => 9.0, 'long' => 47.0, 'distance' => anything },
     { 'lat' => 10.0, 'long' => 50.0, 'distance' => anything }]
  end

  it 'should return closest doctors for (10, 50)' do
    doctors = @locator.find_doctors(2, 10.0, 50.0, 5)

    doctors.should ==[{ 'lat' => 10.0, 'long' => 50.0, 'distance' => anything },
                      { 'lat' => 8.0, 'long' => 48.0, 'distance' => anything },
                      { 'lat' => 9.0, 'long' => 47.0, 'distance' => anything },
                      { 'lat' => 7.0, 'long' => 49.0, 'distance' => anything }]
  end
end