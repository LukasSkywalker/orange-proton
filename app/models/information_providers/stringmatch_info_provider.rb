#encoding: utf-8

# This finds Fachgebiete related to an illness by comparing the (german) name of the 
# illness or any of it's synonyms and the name of the fachgebiet.
# We have precomputed this data and stored it in the db.
class StringmatchInfoProvider < DatabaseInfoProvider

  def initialize
    super
    @map ={'ologie' => '', 'opathie' => '', 'iatrie' => '', 'medizin' => '', 'enter' => '', 'exter' => '',
           'ische' => '', 'ierte' => '', 'ative' => '', 'tion' => ' ', ' und '=> ' ', ' durch ' => ' ',
           'krankheit' => '', 'endo' => '', 'chungen' => '', 'klassisch' => '', 'mato' => '', 'gesichert' => '',
           'ologisch' => '', ' der '=> ' ', ' des '=>' ', ' am ' => ' ', ' an '=>' ', 'akut' => '', 'schwer' => '',
           'sonstige' =>  '', 'opth' => '', 'nicht' => '', 'näher' => '', 'ohne' => '', 'angabe' =>'', ' mit '=> '',
           ' für '=>'', 'blindh' => 'blindhh', 'haut' => 'hautt', 'heit' => '', 'hiv' => 'hi-virus', 'behandlung' => '',
           'lunge' => 'l{unge}', 'ungen' => '', 'erkrankung' => '', 'übertragbar' => '' }
  end

  def get_fields(icd_code, max_count, language)
    best_fields = self.db.get_fields_by_char_match(icd_code, max_count)

    fs = []
    best_fields.each do |field|
      fs_code = field['fs_code']
      # scale relatedness (this somehow has to consider synonyms and synonymlength!)
      relatedness = field['by_seq_match'].to_f / 
        cmatch_prepare(self.db.get_fs_name(fs_code, 'de')).length
      fs << new_fs_field_entry(fs_code, relatedness, language)
    end

    normalize_relatedness(fs)

    fs
  end

  private
  def cmatch_prepare(s)
    s.downcase!
    @map.each{|a,b| s.gsub!(a, b)}
    s
  end
end
