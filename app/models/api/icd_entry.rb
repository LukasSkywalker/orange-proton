class IcdEntry
  attr_accessor :code,
                :super_class,
                :text,
                :inclusiva,
                :exclusiva,
                :notes,
                :coding_hints,
                :sub_classes,
                :modifiers,
                :synonyms

  class << self
    def create
      IcdEntry.new
    end
  end
end