require 'spec_helper'

module HelpersForCodes ; end  # we don't have a class named like that, but describe expects this name to exist

describe HelpersForCodes do

  it 'should assert only correct things' do
    assert(true)
    assert(1)
    #expect {assert(0)}.to raise_error # not working???
    expect {assert(false)}.to raise_error
    expect {assert(nil)}.to raise_error
  end
  
  it 'should find code type of chop' do
    get_code_type('00.4D').should be :chop
    get_code_type('89.d3.5C').should be :chop
    get_code_type('99.B6.11').should be :chop
    get_code_type('Z55.69.0').should be :chop
  end

  it 'should find code type of icd' do
    get_code_type('A66.0').should be :icd
    get_code_type('K58').should be :icd
    get_code_type('Z09.22').should be :icd
  end

  it 'should find code type of unknown' do
    get_code_type('A').should be :unknown
    get_code_type('C0.4d').should be :unknown
    get_code_type('z45.P').should be :unknown
    get_code_type('SS5.22').should be :unknown
    get_code_type('999.b6.11').should be :unknown
  end

  it 'should recognize super and subclasses' do
    icd_subclass?('A00.9').should be_true
    icd_subclass?('A00').should be_false
    to_icd_superclass('A00.9').should eq('A00')
  end
end   

