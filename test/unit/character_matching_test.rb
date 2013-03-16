require 'test/unit'
require 'minitest/reporters'
require_relative '../../datalinkers/character_matching'

MiniTest::Reporters.use!

class BaseInfoProviderTest < Test::Unit::TestCase

  def test_character_matching
    assert_equal(character_matching('helloi', 'helloi'), 2)
    assert_equal(character_matching('helloi', 'hello hello'), 2)

    assert_equal(character_matching('kardiologie', 'endokrinologie'), 0)
    assert_equal(character_matching('kardiographie', 'pathologie'), 0)
    assert_equal(character_matching('sportmedizin', 'tauchmedizin'), 0)
    assert_equal(character_matching('psychotherapie', 'sporttherapie'), 0)
    assert_equal(character_matching('allgemeinchirurgie', 'augenchirurgie'), 0)
    assert_equal(character_matching('gastroskopie', 'teleskopie'), 0)
    assert_equal(character_matching('psychiatrie', 'entwicklungspaediatrie'), 0)
    assert_equal(character_matching('homoeopathie', 'animalopathie'), 0)

    assert_equal(character_matching('psychotherapie', 'psychiatrie'), 1)
    assert_equal(character_matching('sportmedizin', 'sporttherapie'), 1)
    assert_equal(character_matching('interventionelle schmerztherapie', 'operative neuraltherapie'), 0)
    assert_equal(character_matching('schmerztherapie', 'schmerz'), 3)
  end

  def test_sequence_matching
    assert_equal(sequence_matching('helloi', 'helloi'), 6)
    assert_equal(sequence_matching('helloi', 'hello hello'), 5)

    assert_equal(sequence_matching('kardiologie', 'endokrinologie'), 0)
    assert_equal(sequence_matching('kardiographie', 'pathologie'), 0)
    assert_equal(sequence_matching('sportmedizin', 'tauchmedizin'), 1)
    assert_equal(sequence_matching('psychotherapie', 'sporttherapie'), 1)
    assert_equal(sequence_matching('allgemeinchirurgie', 'augenchirurgie'), 1)
    assert_equal(sequence_matching('gastroskopie', 'teleskopie'), 1)
    assert_equal(sequence_matching('psychiatrie', 'entwicklungspaediatrie'), 0)
    assert_equal(sequence_matching('homoeopathie', 'animalopathie'), 0)

    assert_equal(sequence_matching('psychotherapie', 'psychiatrie'), 5)
    assert_equal(sequence_matching('sportmedizin', 'sporttherapie'), 5)
    assert_equal(sequence_matching('interventionelle schmerztherapie', 'operative neuraltherapie'), 1)
    assert_equal(sequence_matching('schmerztherapie', 'schmerz'), 7)
  end
end
