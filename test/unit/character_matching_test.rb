require 'test/unit'
require 'minitest/reporters'
require_relative '../../datalinkers/character_matching'

MiniTest::Reporters.use!

class BaseInfoProviderTest < Test::Unit::TestCase

  # tests for character_matching method
  def test_character_matching
    search = 'kardiographie'
    assert_equal(character_matching('krigahe', search), 0)
    assert_equal(character_matching('kardi', search), 1)
    assert_equal(character_matching('kgraphe', search), 1)
    assert_equal(character_matching('kardiologe', search), 2)
    assert_equal(character_matching('kardigraph', search), 2)
    assert_equal(character_matching('kardiograph', search), 7)
    assert_equal(character_matching('rdiographie', search), 7)
    assert_equal(character_matching('kardiographi', search), 8)
    assert_equal(character_matching('ardiographie', search), 8)
    assert_equal(character_matching('kardiographie', search), 9)
    assert_equal(character_matching('KARDIOGRAPHIE', search), 9)
  end
end
