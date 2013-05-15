#encoding: utf-8
require 'spec_helper'

describe 'code search', :type => :feature do
  it "start search on button click" do
    visit '/'
    fill_in('code', :with => 'B20')
    find('#search-button').click
    page.should have_content 'Infektiöse und parasitäre Krankheiten'
  end
  
  it "start search on enter press" do
    visit '/'
    fill_in('code', :with => 'B20')
    find('#code').native.send_keys(:return)
    page.should have_content 'Infektiöse und parasitäre Krankheiten'
  end
end
